///<reference path="../typings/tsd.d.ts" />

import chai = require('chai');
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

describe("Type Binging Class Test Suite", () => {

    before(function(){

    });

    describe("When constructor is invoked", () => {

        it('should set its own properties correctly', (done) => {
          var runtimeIdentifier = "fooInterface";
          var binding =  new TypeBinding<fooInterface>(runtimeIdentifier, foo);
          expect(binding.runtimeIdentifier).to.equals(runtimeIdentifier);
          expect(binding.implementationType).to.equals(foo);
          expect(binding.cache).to.equals(null);
          done();
        });

        it("should be able to use implementationType as a constructor", (done) => {
          var runtimeIdentifier = "fooInterface";
          var binding =  new TypeBinding<fooInterface>(runtimeIdentifier, foo);
          var instance = new binding.implementationType();
          expect(instance.bar()).to.equals("bar");
          done();
        });
    });
});
