///<reference path="../typings/tsd.d.ts" />

import { inversify } from "../source/inversify";
import { Lookup } from "../source/lookup";
var expect = chai.expect;

//******************************************************************************
//* MOCKS AND STUBS
//******************************************************************************
interface FooInterface {
  name : string;
  greet() : string;
}

interface BarInterface {
  name : string;
  greet() : string;
}

interface FooBarInterface {
  foo : FooInterface;
  bar : BarInterface;
  greet() : string;
}

export class Foo implements FooInterface {
  public name : string;
  constructor() {
    this.name = "foo";
  }
  public greet() : string {
    return this.name;
  }
}

class Bar implements BarInterface {
  public name : string;
  constructor() {
    this.name = "bar";
  }
  public greet() : string {
    return this.name;
  }
}

class FooBar implements FooBarInterface {
  public foo : FooInterface;
  public bar : BarInterface;
  constructor(FooInterface : FooInterface, BarInterface : BarInterface) {
    this.foo = FooInterface;
    this.bar = BarInterface;
  }
  public greet() : string{
    return this.foo.greet() + this.bar.greet();
  }
}

//******************************************************************************
//* TYPE BINDING CLASS
//******************************************************************************
describe("Type Binging Class Test Suite \n", () => {

  it('It should set its own properties correctly \n', (done) => {

    var runtimeIdentifier = "FooInterface";
    var binding =  new inversify.TypeBinding<FooInterface>(runtimeIdentifier, Foo);
    expect(binding.runtimeIdentifier).to.equals(runtimeIdentifier);
    expect(binding.implementationType).to.not.equals(null);
    expect(binding.cache).to.equals(null);
    expect(binding.scope).to.equal(inversify.TypeBindingScopeEnum.Transient);

    var runtimeIdentifier = "BarInterface";
    var binding =  new inversify.TypeBinding<BarInterface>(
      runtimeIdentifier, Bar, inversify.TypeBindingScopeEnum.Singleton);

    expect(binding.runtimeIdentifier).to.equals(runtimeIdentifier);
    expect(binding.implementationType).to.not.equals(null);
    expect(binding.cache).to.equals(null);
    expect(binding.scope).to.equal(inversify.TypeBindingScopeEnum.Singleton);

    done();
  });

  it("It should be able to use implementationType as a constructor \n", (done) => {
    var runtimeIdentifier = "FooInterface";
    var binding =  new inversify.TypeBinding<FooInterface>(runtimeIdentifier, Foo);
    var instance = new binding.implementationType();
    expect(instance.greet()).to.equals("foo");
    done();
  });

  it("Throws when invalid scope \n", (done) => {
    var runtimeIdentifier = "FooInterface";
    var scopeType = 3;
    var fn = function() {
      new inversify.TypeBinding<FooInterface>(runtimeIdentifier, Foo, scopeType);
    }
    expect(fn).to.throw(`Invalid scope type ${scopeType}`);
    done();
  });

});

//******************************************************************************
//* KERNEL CLASS
//******************************************************************************
describe('Kernel Test Suite \n', () => {

  it('It should be able to resolve a service without dependencies \n', (done) => {
    var expected = new Foo();
    var kernel = new inversify.Kernel();
    var runtimeIdentifier = "FooInterface";
    var binding =  new inversify.TypeBinding<FooInterface>(runtimeIdentifier, Foo);
    kernel.bind(binding);
    var result = kernel.resolve<FooInterface>(runtimeIdentifier);
    expect(expected.name).to.equals(result.name);
    expect(expected.greet()).to.equals(result.greet());
    done();
  });

  it('It should be able to resolve a complex dependencies tree \n', (done) => {
    var kernel = new inversify.Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";
    var fooBarRuntimeIdentifier = "FooBarInterface";

    var fooBinding =  new inversify.TypeBinding<FooInterface>(fooRuntimeIdentifier, Foo);
    var barBinding =  new inversify.TypeBinding<BarInterface>(barRuntimeIdentifier, Bar);

    var fooBarBinding =  new inversify.TypeBinding<FooBarInterface>(
      fooBarRuntimeIdentifier, FooBar, inversify.TypeBindingScopeEnum.Singleton);

    kernel.bind(fooBinding);
    kernel.bind(barBinding);
    kernel.bind(fooBarBinding);

    var fooResult = kernel.resolve<FooInterface>(fooRuntimeIdentifier);
    var barResult = kernel.resolve<BarInterface>(barRuntimeIdentifier);
    var fooBarresult = kernel.resolve<FooBarInterface>(fooBarRuntimeIdentifier);

    expect(fooBarresult.foo).to.not.be.null;
    expect(fooBarresult.bar).to.not.be.null;

    expect(fooBarresult.greet()).to.eql("foobar");

    done();
  });

  it('It should NOT be able to resolve unbound dependencies \n', (done) => {
    var kernel = new inversify.Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";

    var barBinding =  new inversify.TypeBinding<BarInterface>(barRuntimeIdentifier, Bar);
    kernel.bind(barBinding);

    var foo = kernel.resolve(fooRuntimeIdentifier);
    var bar = kernel.resolve(barRuntimeIdentifier);
    expect(foo).to.be.null;
    expect(bar).to.not.be.null;
    done();
  });

  it('It should store singleton type bindings in cache \n', (done) => {
    var kernel = new inversify.Kernel();
    var runtimeIdentifier = "FooInterface";

    // Singleton binding
    var binding =  new inversify.TypeBinding<FooInterface>(
      runtimeIdentifier, Foo, inversify.TypeBindingScopeEnum.Singleton);

    kernel.bind(binding);

    var expected = kernel.resolve<FooInterface>(runtimeIdentifier);
    expected.name = "new name";

    // Because is a singleton expected.name should equal result.name
    var result = kernel.resolve<FooInterface>(runtimeIdentifier);

    expect(expected.name).to.equals(result.name);
    expect(expected.greet()).to.equals(result.greet());
    done();
  });

  it('It should unbind a binding when requested \n', (done) => {
    var kernel = new inversify.Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";

    var fooBinding =  new inversify.TypeBinding<FooInterface>(fooRuntimeIdentifier, Foo);
    var barBinding =  new inversify.TypeBinding<BarInterface>(barRuntimeIdentifier, Bar);
    kernel.bind(fooBinding);
    kernel.bind(barBinding);

    var foo = kernel.resolve(fooRuntimeIdentifier);
    var bar = kernel.resolve(barRuntimeIdentifier);
    expect(foo).to.not.be.null;
    expect(bar).to.not.be.null;

    kernel.unbind(fooRuntimeIdentifier);
    var foo = kernel.resolve(fooRuntimeIdentifier);
    var bar = kernel.resolve(barRuntimeIdentifier);
    expect(foo).to.be.null;
    expect(bar).to.not.be.null;

    done();
  });

  it('It should unbind all bindings when requested \n', (done) => {
    var kernel = new inversify.Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";

    var fooBinding =  new inversify.TypeBinding<FooInterface>(fooRuntimeIdentifier, Foo);
    var barBinding =  new inversify.TypeBinding<BarInterface>(barRuntimeIdentifier, Bar);
    kernel.bind(fooBinding);
    kernel.bind(barBinding);

    kernel.unbindAll();

    var foo = kernel.resolve(fooRuntimeIdentifier);
    var bar = kernel.resolve(barRuntimeIdentifier);
    expect(foo).to.be.null;
    expect(bar).to.be.null;

    done();
  });

  it('Throw when cannot unbind \n', (done) => {
    var kernel = new inversify.Kernel();
    var fooRuntimeIdentifier = "FooInterface";

    var fn = function() {
      kernel.unbind(fooRuntimeIdentifier);
    }

    expect(fn).to.throw(`Could not resolve service ${fooRuntimeIdentifier}`);
    done();
  });

});

//******************************************************************************
//* LOOKUP CLASS
//******************************************************************************
describe('Lookup Test Suite \n', () => {

  it('Key cannot be null when invoking get() remove() or hasKey() \n', (done) => {
    var lookup = new Lookup<any>();
    var getFn = function() { lookup.get(null); }
    var removeFn = function() { lookup.remove(null); }
    var hasKeyFn = function() { lookup.hasKey(null); }

    expect(getFn).to.throw("Argument Null");
    expect(removeFn).to.throw("Argument Null");
    expect(hasKeyFn).to.throw("Argument Null");
    done();
  });

  it('Key cannot be null when invoking add() \n', (done) => {
    var lookup = new Lookup<any>();
    var addFn = function() { lookup.add(null, 1); }
    expect(addFn).to.throw("Argument Null");
    done();
  });

  it('Value cannot be null when invoking add() \n', (done) => {
    var lookup = new Lookup<any>();
    var addFn = function() { lookup.add("TEST_KEY", null); }
    expect(addFn).to.throw("Argument Null");
    done();
  });

  it('Value cannot be null when invoking add() \n', (done) => {
    var lookup = new Lookup<any>();
    var key = "TEST_KEY";
    lookup.add(key, 1);
    lookup.add(key, 2);
    var result = lookup.get(key);
    expect(result.length).to.eql(2);
    done();
  });

  it('Throws when key not found \n', (done) => {
    var lookup = new Lookup<any>();
    var fn = function() {
      lookup.get("THIS_KEY_IS_NOT_AVAILABLE");
    }
    expect(fn).to.throw("Key Not Found");
    done();
  });

});
