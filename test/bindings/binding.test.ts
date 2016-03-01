///<reference path="../../typings/browser.d.ts" />

import { expect } from "chai";
import { Binding, BindingScope } from "../../src/inversify";
import * as Stubs from "../utils/stubs";

describe("Binding", () => {

  it("Should set its own properties correctly", (done) => {

    let fooIdentifier = "FooInterface";
    let fooBinding =  new Binding<Stubs.FooInterface>(fooIdentifier, Stubs.Foo);
    expect(fooBinding.runtimeIdentifier).to.equals(fooIdentifier);
    expect(fooBinding.implementationType).to.not.equals(null);
    expect(fooBinding.cache).to.equals(null);
    expect(fooBinding.scope).to.equal(BindingScope.Transient);

    let barIdentifier = "BarInterface";
    let barBinding =  new Binding<Stubs.BarInterface>(
      barIdentifier, Stubs.Bar, BindingScope.Singleton
    );

    expect(barBinding.runtimeIdentifier).to.equals(barIdentifier);
    expect(barBinding.implementationType).to.not.equals(null);
    expect(barBinding.cache).to.equals(null);
    expect(barBinding.scope).to.equal(BindingScope.Singleton);

    done();
  });

  it("Should be able to use implementationType as a constructor", (done) => {
    let runtimeIdentifier = "FooInterface";
    let binding =  new Binding<Stubs.FooInterface>(runtimeIdentifier, Stubs.Foo);
    let instance = new binding.implementationType();
    expect(instance.greet()).to.equals("foo");
    done();
  });

  it("Should throw when attempting to use an invalid scope", (done) => {
    let runtimeIdentifier = "FooInterface";
    let scopeType = 3;
    let fn = function() {
        return new Binding<Stubs.FooInterface>(runtimeIdentifier, Stubs.Foo, scopeType);
    };
    expect(fn).to.throw(`Invalid scope type ${scopeType}`);
    done();
  });

});
