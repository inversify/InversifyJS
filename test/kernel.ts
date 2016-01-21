import { expect } from 'chai';

describe('Kernel Test Suite \n', () => {

  it('It should be able to resolve a service without dependencies \n', (done) => {
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

  it('It should be able to resolve a complex dependencies tree \n', (done) => {
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

  it('It should NOT be able to resolve unbound dependencies \n', (done) => {
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

  it('It should store singleton type bindings in cache \n', (done) => {
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

  it('It should unbind a binding when requested \n', (done) => {
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

  it('It should unbind all bindings when requested \n', (done) => {
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
