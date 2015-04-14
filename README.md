# InversifyJS
A lightweight IoC container written in TypeScript.

### Why InversifyJS?

Inversify is a lightweight pico inversion of control (IoC) container
for TypeScript and JavaScript apps.

A pico IoC container uses a class constructor to identify and inject its
dependencies. For this to work, the class needs to declare a constructor that
includes everything it needs injected.

In order to resolve a depencency, the pico container needs to be told which
implementation type (classes) to associate with each service type (interfaces).

### InversifyJS is easy to configure

##### 1. Declare your classes and interfaces
todo

```
interface FooInterface {
  log() : void;
}
 
interface BarInterface {
  log() : void;
}
 
interface FooBarInterface {
  log() : void;
}
 
class Foo implements FooInterface {
  public log(){ 
    console.log("foo"); 
  }
}
 
class Bar implements BarInterface {
  public log(){ 
    console.log("bar"); 
  }
}
 
class FooBar implements FooBarInterface {
  public foo : FooInterface;
  public bar : BarInterface;
  public log(){ 
    console.log("foobar"); 
  }
  constructor(FooInterface : FooInterface, BarInterface : BarInterface) {
    this.foo = FooInterface;
    this.bar = BarInterface;
  }
}
```

##### 2. Create a kernel and set up your app's type bindings
todo

A type binding (or just a binding) is a mapping between a service type
(an interface), and an implementation type to be used to satisfy such a
service requirement.

```
// kernel
var kernel = new inversify.Kernel();
 
// bind
kernel.bind(new inversify.TypeBinding<FooInterface>("FooInterface", Foo));
kernel.bind(new inversify.TypeBinding<BarInterface>("BarInterface", Bar));
kernel.bind(new inversify.TypeBinding<FooBarInterface>("FooBarInterface", FooBar));
```
##### 3. Resolve dependencies
todo

```
var foobar = kernel.resolve<FooBarInterface>("FooBarInterface");

// Foo and bar instances has been injected to foobar via its constructor
foobar.foo.log(); // foo
foobar.bar.log(); // foo
foobar.log(); // foobar
```

### Compatible with JavaScript

todo

##### 1. Declare your classes
todo

```
var Foo = (function () {
    function Foo() {
    }
    Foo.prototype.log = function () {
        console.log("foo");
    };
    return Foo;
})();
 
var Bar = (function () {
    function Bar() {
    }
    Bar.prototype.log = function () {
        console.log("bar");
    };
    return Bar;
})();
 
var FooBar = (function () {
    function FooBar(FooInterface, BarInterface) {
        this.foo = FooInterface;
        this.bar = BarInterface;
    }
    FooBar.prototype.log = function () {
        console.log("foobar");
    };
    return FooBar;
})();
``` 

##### 2. Create a kernel and set up your app's type bindings

todo

A type binding (or just a binding) is a mapping between a service type
(an interface), and an implementation type to be used to satisfy such a
service requirement.

todo

```
// kernel
var kernel = new inversify.Kernel();
 
// bind
kernel.bind(new inversify.TypeBinding("FooInterface", Foo));
kernel.bind(new inversify.TypeBinding("BarInterface", Bar));
kernel.bind(new inversify.TypeBinding("FooBarInterface", FooBar));
 ```
##### 3. Resolve dependencies

todo

 ```
// resolve
var foobar = kernel.resolve("FooBarInterface");

// Foo and bar instances has been injected to foobar via its constructor
foobar.foo.log(); // foo
foobar.bar.log(); // foo
foobar.log(); // foobar
```

### Easy to integrate with frameworks

todo

###  Easy to integrate with module loaders

todo

### License

todo
