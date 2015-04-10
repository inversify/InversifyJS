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
interface fooInterface {
  bar() : void;
}

class foo implements fooInterface {
  public bar() {
    return "bar";
  }
}
```

##### 2. Create a kernel and set up your app's type bindings
todo

A type binding (or just a binding) is a mapping between a service type
(an interface), and an implementation type to be used to satisfy such a
service requirement.

```
var kernel = new Kernel();
kernel.bind(new TypeBinding<fooInterface>("fooInterface", foo));
```
##### 3. We are done!
todo

```
var instance = kernel.resolve<fooInterface>("fooInterface");
```

### InversifyJS is compatible with TypeScript and JavaScript

todo

### InversifyJS is compatible with many frameworks

todo

### InversifyJS is compatible with module loaders

todo

### License

todo
