///<reference path="../typings/main.d.ts" />

import { expect } from 'chai';
import { Kernel, TypeBinding, TypeBindingScopeEnum } from "../source/inversify";
import * as Stubs from './utils/stubs';

declare var Map;

describe('Kernel', () => {

  it('should be able to resolve a service without dependencies', (done) => {
    var expected = new Stubs.Foo();
    var kernel = new Kernel();
    var runtimeIdentifier = "FooInterface";
    var binding =  new TypeBinding<Stubs.FooInterface>(runtimeIdentifier, Stubs.Foo);
    kernel.bind(binding);
    var result = kernel.resolve<Stubs.FooInterface>(runtimeIdentifier);
    expect(expected.name).to.equals(result.name);
    expect(expected.greet()).to.equals(result.greet());
    done();
  });

  it('should be able to resolve a complex dependencies tree', (done) => {
    var kernel = new Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";
    var fooBarRuntimeIdentifier = "FooBarInterface";

    var fooBinding =  new TypeBinding<Stubs.FooInterface>(fooRuntimeIdentifier, Stubs.Foo);
    var barBinding =  new TypeBinding<Stubs.BarInterface>(barRuntimeIdentifier, Stubs.Bar);

    var fooBarBinding =  new TypeBinding<Stubs.FooBarInterface>(
      fooBarRuntimeIdentifier, Stubs.FooBar, TypeBindingScopeEnum.Singleton);

    kernel.bind(fooBinding);
    kernel.bind(barBinding);
    kernel.bind(fooBarBinding);

    var fooResult = kernel.resolve<Stubs.FooInterface>(fooRuntimeIdentifier);
    var barResult = kernel.resolve<Stubs.BarInterface>(barRuntimeIdentifier);
    var fooBarresult = kernel.resolve<Stubs.FooBarInterface>(fooBarRuntimeIdentifier);

    expect(fooBarresult.foo).to.not.be.null;
    expect(fooBarresult.bar).to.not.be.null;

    expect(fooBarresult.greet()).to.eql("foobar");

    done();
  });

  it('should NOT be able to resolve unbound dependencies', (done) => {
    var kernel = new Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";

    var barBinding =  new TypeBinding<Stubs.BarInterface>(barRuntimeIdentifier, Stubs.Bar);
    kernel.bind(barBinding);

    var foo = kernel.resolve(fooRuntimeIdentifier);
    var bar = kernel.resolve(barRuntimeIdentifier);
    expect(foo).to.be.null;
    expect(bar).to.not.be.null;
    done();
  });

  it('should store singleton type bindings in cache', (done) => {
    var kernel = new Kernel();
    var runtimeIdentifier = "FooInterface";

    // Singleton binding
    var binding =  new TypeBinding<Stubs.FooInterface>(
      runtimeIdentifier, Stubs.Foo, TypeBindingScopeEnum.Singleton);

    kernel.bind(binding);

    var expected = kernel.resolve<Stubs.FooInterface>(runtimeIdentifier);
    expected.name = "new name";

    // Because is a singleton expected.name should equal result.name
    var result = kernel.resolve<Stubs.FooInterface>(runtimeIdentifier);

    expect(expected.name).to.equals(result.name);
    expect(expected.greet()).to.equals(result.greet());
    done();
  });

  it('should unbind a binding when requested', (done) => {
    var kernel = new Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";

    var fooBinding =  new TypeBinding<Stubs.FooInterface>(fooRuntimeIdentifier, Stubs.Foo);
    var barBinding =  new TypeBinding<Stubs.BarInterface>(barRuntimeIdentifier, Stubs.Bar);
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

  it('should unbind all bindings when requested', (done) => {
    var kernel = new Kernel();
    var fooRuntimeIdentifier = "FooInterface";
    var barRuntimeIdentifier = "BarInterface";

    var fooBinding =  new TypeBinding<Stubs.FooInterface>(fooRuntimeIdentifier, Stubs.Foo);
    var barBinding =  new TypeBinding<Stubs.BarInterface>(barRuntimeIdentifier, Stubs.Bar);
    kernel.bind(fooBinding);
    kernel.bind(barBinding);

    kernel.unbindAll();

    var foo = kernel.resolve(fooRuntimeIdentifier);
    var bar = kernel.resolve(barRuntimeIdentifier);
    expect(foo).to.be.null;
    expect(bar).to.be.null;

    done();
  });

  it('throws when cannot unbind', (done) => {
    var kernel = new Kernel();
    var fooRuntimeIdentifier = "FooInterface";

    var fn = function() {
      kernel.unbind(fooRuntimeIdentifier);
    }

    expect(fn).to.throw(`Could not resolve service ${fooRuntimeIdentifier}`);
    done();
  });

});
