///<reference path="../typings/tsd.d.ts" />
/// <reference path="./mocks"/>

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

describe('Kernel Test Suite \n', () => {

  describe('When resolving dependencies \n', () => {

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

    it('It should store implementation type in cache \n', (done) => {
      // TODO
      done();
    });

    it('It should unbind a binding when requested \n', (done) => {
      // TODO
      done();
    });

    it('It should unbind all bindings when requested \n', (done) => {
      // TODO
      done();
    });

  });
});
