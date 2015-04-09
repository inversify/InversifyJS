///<reference path="../typings/tsd.d.ts" />

import chai = require('chai');
import Kernel = require('../source/kernel');
import TypeBinding = require('../source/type_binding');
var expect = chai.expect;

interface fooInterface {
  bar() : void;
}

class foo implements fooInterface {
  public bar() {
    return "bar";
  }
}

describe('Kernel Test Suite', () => {

    describe('When resolving dependencies', () => {

      it('it should be able to resolve a service without dependencies', (done) => {
        var expected = new foo();
        var kernel = new Kernel();
        var runtimeIdentifier = "fooInterface";
        var binding =  new TypeBinding<fooInterface>(runtimeIdentifier, foo);
        kernel.bind(binding);
        var result = kernel.resolve<fooInterface>("fooInterface");
        expect(expected).to.equals(result);
        done();
      });

      it('it should store implementation type in cache', (done) => {
        // TODO
        done();
      });

      it('it should unbind a binding when requested', (done) => {
        // TODO
        done();
      });

      it('it should unbind all bindings when requested', (done) => {
        // TODO
        done();
      });

    });
});
