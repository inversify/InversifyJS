///<reference path="../typings/tsd.d.ts" />

import { expect } from 'chai';
import { TypeBinding, TypeBindingScopeEnum } from "../source/inversify";
import * as Stubs from './utils/stubs';

describe("TypeBinding", () => {

  it('should set its own properties correctly', (done) => {

    var runtimeIdentifier = "FooInterface";
    var binding =  new TypeBinding<Stubs.FooInterface>(runtimeIdentifier, Stubs.Foo);
    expect(binding.runtimeIdentifier).to.equals(runtimeIdentifier);
    expect(binding.implementationType).to.not.equals(null);
    expect(binding.cache).to.equals(null);
    expect(binding.scope).to.equal(TypeBindingScopeEnum.Transient);

    var runtimeIdentifier = "BarInterface";
    var binding =  new TypeBinding<Stubs.BarInterface>(
      runtimeIdentifier, Stubs.Bar, TypeBindingScopeEnum.Singleton);

    expect(binding.runtimeIdentifier).to.equals(runtimeIdentifier);
    expect(binding.implementationType).to.not.equals(null);
    expect(binding.cache).to.equals(null);
    expect(binding.scope).to.equal(TypeBindingScopeEnum.Singleton);

    done();
  });

  it("should be able to use implementationType as a constructor", (done) => {
    var runtimeIdentifier = "FooInterface";
    var binding =  new TypeBinding<Stubs.FooInterface>(runtimeIdentifier, Stubs.Foo);
    var instance = new binding.implementationType();
    expect(instance.greet()).to.equals("foo");
    done();
  });

  it("throws when invalid scope", (done) => {
    var runtimeIdentifier = "FooInterface";
    var scopeType = 3;
    var fn = function() {
      new TypeBinding<Stubs.FooInterface>(runtimeIdentifier, Stubs.Foo, scopeType);
    }
    expect(fn).to.throw(`Invalid scope type ${scopeType}`);
    done();
  });

});
