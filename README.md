# InversifyJS
A lightweight IoC container written in TypeScript.

### Why InversifyJS?

todo

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
