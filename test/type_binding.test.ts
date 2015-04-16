///<reference path="../typings/tsd.d.ts" />

import chai = require('chai');
import inversify = require("../source/inversify");
var expect = chai.expect;

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
  
});
