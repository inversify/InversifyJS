///<reference path="../typings/tsd.d.ts" />
///<reference path="../source/interfaces.d.ts" />

import { Kernel, TypeBinding, TypeBindingScopeEnum, Inject } from "../source/inversify";
import { Lookup } from "../source/lookup";
import chai = require('chai');

var expect = chai.expect;

declare var Map;

// Polyfill for Function.prototype.bind more details at
// https://github.com/ariya/phantomjs/issues/10522
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // native functions don't have a prototype
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}

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
    var binding =  new TypeBinding<FooInterface>(runtimeIdentifier, Foo);
    expect(binding.runtimeIdentifier).to.equals(runtimeIdentifier);
    expect(binding.implementationType).to.not.equals(null);
    expect(binding.cache).to.equals(null);
    expect(binding.scope).to.equal(TypeBindingScopeEnum.Transient);

    var runtimeIdentifier = "BarInterface";
    var binding =  new TypeBinding<BarInterface>(
      runtimeIdentifier, Bar, TypeBindingScopeEnum.Singleton);

    expect(binding.runtimeIdentifier).to.equals(runtimeIdentifier);
    expect(binding.implementationType).to.not.equals(null);
    expect(binding.cache).to.equals(null);
    expect(binding.scope).to.equal(TypeBindingScopeEnum.Singleton);

    done();
  });

  it("It should be able to use implementationType as a constructor \n", (done) => {
    var runtimeIdentifier = "FooInterface";
    var binding =  new TypeBinding<FooInterface>(runtimeIdentifier, Foo);
    var instance = new binding.implementationType();
    expect(instance.greet()).to.equals("foo");
    done();
  });

  it("Throws when invalid scope \n", (done) => {
    var runtimeIdentifier = "FooInterface";
    var scopeType = 3;
    var fn = function() {
      new TypeBinding<FooInterface>(runtimeIdentifier, Foo, scopeType);
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
    var kernel = new Kernel();
    var runtimeIdentifier = "FooInterface";
    var binding =  new TypeBinding<FooInterface>(runtimeIdentifier, Foo);
    kernel.bind(binding);
    var result = kernel.resolve<FooInterface>(runtimeIdentifier);
    expect(expected.name).to.equals(result.name);
    expect(expected.greet()).to.equals(result.greet());
    done();
  });

  it('It should be able to resolve a complex dependencies tree \n', (done) => {
    var kernel = new Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";
    var fooBarRuntimeIdentifier = "FooBarInterface";

    var fooBinding =  new TypeBinding<FooInterface>(fooRuntimeIdentifier, Foo);
    var barBinding =  new TypeBinding<BarInterface>(barRuntimeIdentifier, Bar);

    var fooBarBinding =  new TypeBinding<FooBarInterface>(
      fooBarRuntimeIdentifier, FooBar, TypeBindingScopeEnum.Singleton);

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
    var kernel = new Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";

    var barBinding =  new TypeBinding<BarInterface>(barRuntimeIdentifier, Bar);
    kernel.bind(barBinding);

    var foo = kernel.resolve(fooRuntimeIdentifier);
    var bar = kernel.resolve(barRuntimeIdentifier);
    expect(foo).to.be.null;
    expect(bar).to.not.be.null;
    done();
  });

  it('It should store singleton type bindings in cache \n', (done) => {
    var kernel = new Kernel();
    var runtimeIdentifier = "FooInterface";

    // Singleton binding
    var binding =  new TypeBinding<FooInterface>(
      runtimeIdentifier, Foo, TypeBindingScopeEnum.Singleton);

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
    var kernel = new Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";

    var fooBinding =  new TypeBinding<FooInterface>(fooRuntimeIdentifier, Foo);
    var barBinding =  new TypeBinding<BarInterface>(barRuntimeIdentifier, Bar);
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
    var kernel = new Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";

    var fooBinding =  new TypeBinding<FooInterface>(fooRuntimeIdentifier, Foo);
    var barBinding =  new TypeBinding<BarInterface>(barRuntimeIdentifier, Bar);
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
    var kernel = new Kernel();
    var fooRuntimeIdentifier = "FooInterface";

    var fn = function() {
      kernel.unbind(fooRuntimeIdentifier);
    }

    expect(fn).to.throw(`Could not resolve service ${fooRuntimeIdentifier}`);
    done();
  });

  it('Not try to find constructor arguments when ES6 and no constructor \n', () => {
    // MORE INFO at https://github.com/inversify/InversifyJS/issues/23

    // using any to access private members
    var kernel : any = new Kernel();
    var binding : any = TypeBinding;

    var A = function(){};
    A.toString = function() { return "class A {\n}"; }

    var B = function(){};
    B.toString = function() { return "class B {\n constructor(a) {\n }\n}"; }

    kernel.bind(new binding('a', A));
    kernel.bind(new binding('b', B));

    // trigger ES6 detection (TODO run tests on real --harmony enviroment)
    Map = function() { };

    // using any to access private members
    var args1 = kernel._getConstructorArguments(A);
    expect(args1).to.be.instanceof(Array);
    expect(args1.length).to.equal(0);

    var args2 = kernel._getConstructorArguments(B);
    expect(args2).to.be.instanceof(Array);
    expect(args2.length).to.equal(1);
    expect(args2[0]).to.be.a('string');
    expect(args2[0]).to.equal("a");

    // roll back ES6 detection
    Map = undefined;
  });

  it('Find constructor arguments when ES6 but written as ES5 constructor with properties containing "class" \n', () => {
    // MORE INFO at https://github.com/inversify/InversifyJS/issues/30

    // using any to access private members
    var kernel : any = new Kernel();
    var binding : any = TypeBinding;

    var C = function(){};
    C.toString = function() { return "var C = function(d) {\n this.classy = false; return this; \n}"; }

    var D = function(){};
    D.toString = function() { return "var D = function(c) {\n this.someClass = 'b'; return this; \n}"; }

    kernel.bind(new binding('c', C));
    kernel.bind(new binding('d', D));

    // trigger ES6 detection (TODO run tests on real --harmony enviroment)
    Map = function() { };

    // using any to access private members
    var argsForC = kernel._getConstructorArguments(C);
    expect(argsForC).to.be.instanceof(Array);
    expect(argsForC.length).to.equal(1);
    expect(argsForC[0]).to.be.a("string");
    expect(argsForC[0]).to.equal("d");

    var argsForD = kernel._getConstructorArguments(D);
    expect(argsForD).to.be.instanceof(Array);
    expect(argsForD.length).to.equal(1);
    expect(argsForD[0]).to.be.a("string");
    expect(argsForD[0]).to.equal("c");

    // roll back ES6 detection
    Map = undefined;
});

  it('Find constructor arguments when ES6 but written as ES5 constructor \n', () => {
    // MORE INFO at https://github.com/inversify/InversifyJS/issues/30

    // using any to access private members
    var kernel : any = new Kernel();
    var binding : any = TypeBinding;

    var E = function(){};
    E.toString = function() { return "function(f) {\n this.constructorfy = true; return this; \n}"; }

    var F = function(){};
    F.toString = function() { return "function(e) {\n this.MajorConstructor(); return this; \n}"; }

    kernel.bind(new binding('e', E));
    kernel.bind(new binding('f', F));

    // trigger ES6 detection (TODO run tests on real --harmony enviroment)
    Map = function() { };

    // using any to access private members
    var argsForE = kernel._getConstructorArguments(E);
    expect(argsForE).to.be.instanceof(Array);
    expect(argsForE.length).to.equal(1);
    expect(argsForE[0]).to.be.a("string");
    expect(argsForE[0]).to.equal("f");

    var argsForF = kernel._getConstructorArguments(F);
    expect(argsForF).to.be.instanceof(Array);
    expect(argsForF.length).to.equal(1);
    expect(argsForF[0]).to.be.a("string");
    expect(argsForF[0]).to.equal("e");

    // roll back ES6 detection
    Map = undefined;
});

it('Find constructor arguments when argumentTypes associated with constructor \n', () => {
  // MORE INFO at https://github.com/inversify/InversifyJS/issues/30

  // using any to access private members
  var kernel : any = new Kernel();
  var binding : any = TypeBinding;

  var G = function(){};
  (<any>G).argumentTypes = ["something", "somethingElse"]

  var H = function(){};
  (<any>H).argumentTypes = ["this", "that"]

  kernel.bind(new binding('g', G));
  kernel.bind(new binding('h', H));

  // trigger ES6 detection (TODO run tests on real --harmony enviroment)
  Map = function() { };

  // using any to access private members
  var argsForG = kernel._getConstructorArguments(G);
  expect(argsForG).to.be.instanceof(Array);
  expect(argsForG.length).to.equal(2);
  expect(argsForG[0]).to.be.a("string");
  expect(argsForG[0]).to.equal("something");
  expect(argsForG[1]).to.be.a("string");
  expect(argsForG[1]).to.equal("somethingElse");

  var argsForH = kernel._getConstructorArguments(H);
  expect(argsForH).to.be.instanceof(Array);
  expect(argsForH.length).to.equal(2);
  expect(argsForH[0]).to.be.a("string");
  expect(argsForH[0]).to.equal("this");
  expect(argsForH[1]).to.be.a("string");
  expect(argsForH[1]).to.equal("that");

  // roll back ES6 detection
  Map = undefined;
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

//******************************************************************************
//* LOOKUP CLASS
//******************************************************************************
describe('Inject Annotation \n', () => {
   it('should resolve a single marked type argument to the type rather than the name', function () {
      let injectable = <InjectableConstructorInterface>{};
      injectable.toString = function() { return "function(aType) { }"; }

      let injectionResolver = Inject("IType");

      injectionResolver(injectable, null, 0);

      expect(injectable.argumentTypes.length).to.equal(1);
      expect(injectable.argumentTypes[0]).to.equal("IType");
   });

   it('should resolve the first marked type to the annotated and second to the named', function () {
      let injectable = <InjectableConstructorInterface>{};
      injectable.toString = function() { return "function(aType, bType) { }"; }

      let injectionResolver = Inject("IType");

      injectionResolver(injectable, null, 0);

      expect(injectable.argumentTypes.length).to.equal(2);
      expect(injectable.argumentTypes[0]).to.equal("IType");
      expect(injectable.argumentTypes[1]).to.equal("bType");
   });

   it('should resolve the first type to the named and second to the annotated', function () {
      let injectable = <InjectableConstructorInterface>{};
      injectable.toString = function() { return "function(aType, bType) { }"; }

      let injectionResolver = Inject("IType");

      injectionResolver(injectable, null, 1);

      expect(injectable.argumentTypes.length).to.equal(2);
      expect(injectable.argumentTypes[0]).to.equal("aType");
      expect(injectable.argumentTypes[1]).to.equal("IType");
   });

   it('should resolve the first marked type to the annotated and second to the named with different argument names', function () {
      let injectable = <InjectableConstructorInterface>{};
      injectable.toString = function() { return "function(something, somethingElse) { }"; }

      let injectionResolver = Inject("Resolvable");

      injectionResolver(injectable, null, 0);

      expect(injectable.argumentTypes.length).to.equal(2);
      expect(injectable.argumentTypes[0]).to.equal("Resolvable");
      expect(injectable.argumentTypes[1]).to.equal("somethingElse");
   });

   it('should resolve the first type to the named and second to the annotated with different argument names', function () {
      let injectable = <InjectableConstructorInterface>{};
      injectable.toString = function() { return "function(something, somethingElse) { }"; }

      let injectionResolver = Inject("Resolvable");

      injectionResolver(injectable, null, 1);

      expect(injectable.argumentTypes.length).to.equal(2);
      expect(injectable.argumentTypes[0]).to.equal("something");
      expect(injectable.argumentTypes[1]).to.equal("Resolvable");
   });
});
