# InversifyJS
[![Join the chat at https://gitter.im/inversify/InversifyJS](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/inversify/InversifyJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://secure.travis-ci.org/inversify/InversifyJS.svg?branch=master)](https://travis-ci.org/inversify/InversifyJS)
[![Coverage Status](https://coveralls.io/repos/inversify/InversifyJS/badge.svg?branch=master)](https://coveralls.io/r/inversify/InversifyJS?branch=master)
[![npm version](https://badge.fury.io/js/inversify.svg)](http://badge.fury.io/js/inversify)
[![Dependencies](https://david-dm.org/inversify/InversifyJS.svg)](https://david-dm.org/inversify/InversifyJS#info=dependencies)
[![img](https://david-dm.org/inversify/InversifyJS/dev-status.svg)](https://david-dm.org/inversify/InversifyJS/#info=devDependencies)
[![img](https://david-dm.org/inversify/InversifyJS/peer-status.svg)](https://david-dm.org/inversify/InversifyJS/#info=peerDependenciess)

<img src="https://raw.githubusercontent.com/inversify/inversify.github.io/master/img/logo.png" width="500"  />

A lightweight IoC container written in TypeScript.
Visit http://inversify.io/ for more information.

### About
InversifyJS is a lightweight (4KB) pico inversion of control (IoC) container for TypeScript and JavaScript apps. A pico IoC container uses a class constructor to identify and inject its dependencies.

InversifyJS is easy to integrate with the majority of existing JavaScript frameworks and encourage the usage of the best OOP and IoC practices.

### Motivation
JavaScript applications are becoming larger and larger day after day. As a result we are using a lot of our architecture experience from languages like Java or C# in JavaScript. We are embracing OOP with JavaScript but we are not writing SOLID JavaScript. InversifyJS has been designed to allow JavaScript developers to write code that adheres to the SOLID principles.

### Philosophy
InversifyJS has been developed with 3 main goals:

1. Allow JavaScript developers to write code that adheres to the SOLID principles.

2. Facilitate and encourage the adherence to the best OOP and IoC practices.

3. Add as little runtime overhead as possible.

# Installation

You can get the latest release and the type definitions using npm.
```
npm install inversify --save
```
**Note**: We have decided to [drop support for bower](https://twitter.com/nachocoloma/status/663622545162280960) and tsd. The InversifyJS type definitions are included in the npm package as it is [recommended by the TypeScript development team](https://github.com/Microsoft/TypeScript/wiki/Typings-for-npm-packages).

If you are planing to use inversify as a global you will need to add a reference to the file named `inversify-global.d.ts` this file is included in the npm package:

```
/// <reference path="./node_modules/inversify/type_definitions/inversify-global.d.ts" />
```

# The Basics (with TypeScript)
The main goal of InversifyJS is top allow JavaScript developers to write code that adheres to the SOLID principles. Many of these principles refer to the usage of interfaces. The main reason why it is not possible to write native SOLID JavaScript is because the language lacks interfaces. In the other hand, TypeScript features interfaces, so, if you are going to use InversifyJS it is recommended to work with TypeScript to get the most out of it.

#### 1. Declare interfaces & implementations

Our goal is to write SOLID code. This means that we should "depend upon Abstractions. Do not depend upon concretions." so we will start by declaring some interfaces (abstractions).

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
```

We can continue declaring some classes which implement them (concretions). We will start by declaring two classes (Foo & Bar) which don't have any dependencies.

```
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
```

Now we are going to declare a class named FooBar, which has two dependencies (FooInterface & BarInterface). Note that the names of the arguments in the Inject decorator are significant because the injector uses these to look up the dependencies.

```
import { Inject } from "inversify";

@Inject("FooInterface", "BarInterface")
class FooBar implements FooBarInterface {
  public foo : FooInterface;
  public bar : BarInterface;
  public log(){
    console.log("foobar");
  }
  constructor(foo : FooInterface, bar : BarInterface) {
    this.foo = foo;
    this.bar = bar;
  }
}
```

#### 2. Bind interfaces to implementations

Before we can start resolving and injecting dependencies we need to create an instance of the InversifyJS Kernel class. The Kernel will automatically detect is a class has some dependencies by examining its constructor. The Kernel will automatically detect if a class has some dependencies by examining the metadata provided by the Inject decorator.

```
import { TypeBinding, Kernel } from "inversify";
var kernel = new Kernel();
```

In order to resolve a dependency, the kernel needs to be told which implementation type (classes) to associate with each service type (interfaces). We will use type bindings for this purpose. A type binding (or just a binding) is a mapping between a service type (an interface), and an implementation type (class).

```
kernel.bind(new TypeBinding<FooInterface>("FooInterface", Foo, TypeBindingScopeEnum.Transient));
kernel.bind(new TypeBinding<BarInterface>("BarInterface", Bar, TypeBindingScopeEnum.Singleton));
kernel.bind(new TypeBinding<FooBarInterface>("FooBarInterface", FooBar));
```

When we declare a type binding, the TypeScript compiler will check that the implementation type (class) is actually and implementation of the service type (interface) and throw a compilation error if that is not the case.

```
// Compilation error: Bar does not implement FooInterface
kernel.bind(new TypeBinding<FooInterface>("FooInterface", Bar));
```

We should keep the InversifyJS Kernel instantiation and type bindings centralized in one unique IoC configuration file. This will help us to abstract our application from the IoC configuration.

#### 3. Resolve & inject dependencies

After declaring the type bindings, we can invoke the kernel resolve method to resolve a dependency. We will use a string as the interface identifier (instead of the interface itself) because the TypeScript interfaces are not available at runtime.

```
var foobar = kernel.resolve<FooBarInterface>("FooBarInterface");
```

If the interface that we are trying to resolve is bind to a class that has some dependencies, InversifyJS will resolve and inject them into a new instance via the class constructor.

```
// Foo and Bar instances has been injected into a new Foobar instance via its constructor
foobar.foo.log(); // foo
foobar.bar.log(); // bar
foobar.log();     // foobar
```

Our application dependency tree should have one unique root element, known as the application composition root, which is the only place where we should invoke the resolve method.

Invoking resolve every time we need to inject something, as if it was a Service Locator is an anti-pattern. If we are working with an MVC framework the composition root should be located in the application class, somewhere along the routing logic or in a controller factory class. Please refer to the integration examples if you need additional help.

# Integration with popular frameworks

InversifyJS was designed with many popular JavaScript frameworks in mind. As a result, it is really easy to integrate with existing JavaScript frameworks and examples of integration with many popular frameworks are available in the [official examples repository](https://github.com/inversify/Inversify-code-samples).

# Good Practices
Dependency Inversion (DI) isn't rocket science. We just need to try to avoid new and singleton except when there's a compelling reason to use them, such as a utility method that has no external dependencies, or a utility class that could not possibly have any purpose outside the framework (interop wrappers and dictionary keys are common examples of this).

Many of the problems with IoC frameworks come up when developers are first learning how to use them, and instead of actually changing the way they handle dependencies and abstractions to fit the IoC model, instead try to manipulate the IoC container to meet the expectations of their old coding style, which would often involve high coupling and low cohesion.

#### Use a Composition Root to avoid the Service Locator anti-pattern

Our application dependency tree should have one unique root element (known as the application composition root) which is the only component where we should invoke the resolve method.

Invoking resolve every time we need to inject something, as if it was a Service Locator is an anti-pattern. If we are working with an MVC framework the composition root should be located in the application class, somewhere along the routing logic or in a controller factory class.

#### Avoid Constructor over-injection

Constructor over-injection is a violation of the Single Responsibility Principle. Too many constructor arguments indicates too many dependencies; too many dependencies indicates that the class is trying to do too much. Usually this error correlates with other code smells, such as unusually long or ambiguous ("manager") class names.

#### Avoid the injection of data, as opposed to behaviour

Injection of data, as opposed to behaviour, is a subtype of the poltergeist anti-pattern, with the 'geist in this case being the container. If a class needs to be aware of the current date and time, you don't inject a DateTime, which is data; instead, you inject an abstraction over the system clock. This is not only correct for DI; it is absolutely essential for testability, so that you can test time-varying functions without needing to actually wait on them.

#### Avoid declaring every life cycle as Singleton

Declaring every life cycle as Singleton is, to me, a perfect example of cargo cult programming and to a lesser degree the colloquially-named "object cesspool". I've seen more singleton abuse than I care to remember, and very little of it involves DI.

#### Avoid implementation-specific interface types

Another common error is implementation-specific interface types done just to be able to register it in the container. This is in and of itself a violation of the Dependency Inversion Principle (just because it's an interface, does not mean it's truly abstract) and often also includes interface bloat which violates the Interface Segregation Principle.

#### Avoid optional dependencies

In other words, there is a constructor that accepts dependency injection, but also another constructor that uses a "default" implementation. This also violates the DIP and tends to lead to LSP violations as well, as developers, over time, start making assumptions around the default implementation, and/or start new-ing up instances using the default constructor.

# Contact
If you want to share your thoughts with the development team or join us you will be able to do so using the [official the mailing list](https://groups.google.com/forum/#!forum/inversifyjs).

You can report issues using the [Github issues page](https://github.com/inversify/InversifyJS/issues).

# License

License under the MIT License (MIT)

Copyright © 2015 [Remo H. Jansen](http://www.remojansen.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
