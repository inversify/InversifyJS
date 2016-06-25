# InversifyJS

[![Join the chat at https://gitter.im/inversify/InversifyJS](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/inversify/InversifyJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://secure.travis-ci.org/inversify/InversifyJS.svg?branch=master)](https://travis-ci.org/inversify/InversifyJS)
[![codecov.io](https://codecov.io/github/inversify/InversifyJS/coverage.svg?branch=master)](https://codecov.io/github/inversify/InversifyJS?branch=master)
[![npm version](https://badge.fury.io/js/inversify.svg)](http://badge.fury.io/js/inversify)
[![Package Quality](http://npm.packagequality.com/shield/inversify.svg)](http://packagequality.com/#?package=inversify)
[![Dependencies](https://david-dm.org/inversify/InversifyJS.svg)](https://david-dm.org/inversify/InversifyJS#info=dependencies)
[![img](https://david-dm.org/inversify/InversifyJS/dev-status.svg)](https://david-dm.org/inversify/InversifyJS/#info=devDependencies)
[![img](https://david-dm.org/inversify/InversifyJS/peer-status.svg)](https://david-dm.org/inversify/InversifyJS/#info=peerDependenciess)
[![Known Vulnerabilities](https://snyk.io/test/github/inversify/InversifyJS/badge.svg)](https://snyk.io/test/github/inversify/InversifyJS)

[![NPM](https://nodei.co/npm/inversify.png?downloads=true&downloadRank=true)](https://nodei.co/npm/inversify/)
[![NPM](https://nodei.co/npm-dl/inversify.png?months=9&height=3)](https://nodei.co/npm/inversify/)

![](https://raw.githubusercontent.com/inversify/inversify.github.io/master/img/cover.jpg)

A powerful and lightweight inversion of control container for JavaScript & Node.js apps powered by TypeScript.

### About
InversifyJS is a lightweight (4KB) inversion of control (IoC) container for TypeScript and JavaScript apps.
A IoC container uses a class constructor to identify and inject its dependencies.
InversifyJS has a friendly API and encourage the usage of the best OOP and IoC practices.

### Motivation
JavaScript now supports object oriented (OO) programming with class based inheritance. These features are great but the truth is that they are also
[dangerous](https://medium.com/@dan_abramov/how-to-use-classes-and-sleep-at-night-9af8de78ccb4).

We need a good OO design ([SOLID](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)), [Composite Reuse](https://en.wikipedia.org/wiki/Composition_over_inheritance), etc.) to protect ourselves from these threats. The problem is that OO design is difficult and that is exactly why we created InversifyJS.

InversifyJS is a tool that helps JavaScript developers to write code with a good OO design.

### Philosophy
InversifyJS has been developed with 4 main goals:

1. Allow JavaScript developers to write code that adheres to the SOLID principles.

2. Facilitate and encourage the adherence to the best OOP and IoC practices.

3. Add as little runtime overhead as possible.

4. Provide a [state of the art development experience](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md).

### Testimonies

**[Nate Kohari](https://twitter.com/nkohari)** - Author of [Ninject](https://github.com/ninject/Ninject)

> *"Nice work! I've taken a couple shots at creating DI frameworks for JavaScript and TypeScript, but the lack of RTTI really hinders things.* 
> *The ES7 metadata gets us part of the way there (as you've discovered). Keep up the great work!"*

### Installation

You can get the latest release and the type definitions using npm:

```
npm install inversify@2.0.0-rc.1 reflect-metadata --save
npm install inversify-dts --save-dev
```

You will also need the type definitions files for inversify and reflect-metadata.

The InversifyJS type definitions are included in the inversify-dts npm package:

```ts
/// <reference path="node_modules/inversify-dts/inversify/inversify.d.ts" />
```

The reflect-metadata type definitions are included in the npm package:

```ts
/// <reference path="node_modules/reflect-metadata/reflect-metadata.d.ts" />
```

InversifyJS requires a modern JavaScript engine with support for the Promise, Reflect (with metadata) and Proxy objects. 
If your environment don't support one of these you will need to import a shim or polyfill. If you are targeting ES5 you will get the following error:

> TypeScript error: node_modules/inversify-dts/inversify/inversify.d.ts(108,13): Error TS2304: Cannot find name 'Promise'.

You can solve this problem by installing type definitions for the Promise API. If you are working on node the node type definitions already include the required definitions. If you are working on a browser app you can use the bluebird type definitions and polyfill:

```
$ typings install --save --global dt~bluebird
```

 Check out the [Environment support and polyfills](https://github.com/inversify/InversifyJS/blob/master/wiki/environment.md) page in the wiki to learn more.

The relect-metadata polyfill can be importing as follows:

```ts
import "reflect-metadata";
```

> **The `reflect-metadata` polyfill should be imported only once in your entire application** because the Reflect object is mean to be a global singleton. More details about this can be found [here](https://github.com/inversify/InversifyJS/issues/262#issuecomment-227593844).

InversifyJS requires the following TypeScript compilation options in your `tsconfig.json` file:

```
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### The Basics (TypeScript)
Let’s take a look to the basic usage and APIs of InversifyJS with TypeScript:

#### Step 1: Declare your interfaces
Our goal is to write code that adheres to the [dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle). 
This means that we should "depend upon Abstractions and do not depend upon concretions". 
Let's start by declaring some interfaces (abstractions).

```ts
interface Ninja {
    fight(): string;
    sneak(): string;
}

interface Katana {
    hit(): string;
}

interface Shuriken {
    throw(): string;
}
```

#### Step 2: Declare dependencies using the `@injectable` & `@inject` decorators
Let's continue by declaring some classes (concretions). The classes are implementations of the interfaces that we just declared. All the classes must be annotated with the `@injectable` decorator. 

When a class has a  dependency on an interface we also need to use the `@inject` decorator to define an identifier for the interface that will be available at runtime. In this case we will use the string literals `"Katana"` and `"Shuriken"` as runtime identifiers.

> **Note**: InversifyJS also support the usage of Classes and Symbols (continue reading to learn more about this).

```ts
import { injectable, inject } from "inversify";
import "reflect-metadata";

@injectable()
class Katana implements Katana {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Shuriken implements Shuriken {
    public throw() {
        return "hit!";
    }
}

@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
	    @inject("Katana") katana: Katana,
	    @inject("Shuriken") shuriken: Shuriken
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

#### Step 3: Create and configure a Kernel
We recommend to do this in a file named `inversify.config.ts`. This is the only place in which there is some coupling.
In the rest of your application your classes should be free of references to other classes.
```ts
import { Kernel } from "inversify";

import { Ninja } from "./entities/ninja";
import { Katana } from "./entities/katana";
import { Shuriken} from "./entities/shuriken";

var kernel = new Kernel();
kernel.bind<Ninja>("Ninja").to(Ninja);
kernel.bind<Katana>("Katana").to(Katana);
kernel.bind<Shuriken>("Shuriken").to(Shuriken);

export default kernel;
```

#### Step 4: Resolve dependencies
You can use the method `get<T>` from the `Kernel` class to resolve a dependency.
Remember that you should do this only in your [composition root](http://blog.ploeh.dk/2011/07/28/CompositionRoot/)
to avoid the [service locator anti-pattern](http://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/).

```ts
import kernel = from "./inversify.config";

var ninja = kernel.get<Ninja>("Ninja");

expect(ninja.fight()).eql("cut!"); // true
expect(ninja.sneak()).eql("hit!"); // true
```

As we can see the `Katana` and `Shuriken` were successfully resolved and injected into `Ninja`.

InversifyJS supports ES5 and ES6 and can work without TypeScript.
Head to the [**JavaScript example**](https://github.com/inversify/InversifyJS/blob/master/wiki/basic_js_example.md) to learn more!

### The InversifyJS Features and API
Let's take a look to the InversifyJS features!

- [Support for classes](https://github.com/inversify/InversifyJS/blob/master/wiki/classes_as_id.md)
- [Support for Symbols](https://github.com/inversify/InversifyJS/blob/master/wiki/symbols_as_id.md)
- [Declaring kernel modules](https://github.com/inversify/InversifyJS/blob/master/wiki/kernel_modules.md)
- [Kernel snapshots](https://github.com/inversify/InversifyJS/blob/master/wiki/kernel_snapshots.md)
- [Controlling the scope of the dependencies](https://github.com/inversify/InversifyJS/blob/master/wiki/scope.md)
- [Injecting a constant or dynamic value](https://github.com/inversify/InversifyJS/blob/master/wiki/value_injection.md)
- [Injecting a class constructor](https://github.com/inversify/InversifyJS/blob/master/wiki/constructor_injection.md)
- [Injecting a Factory](https://github.com/inversify/InversifyJS/blob/master/wiki/factory_injection.md)
- [Auto factory](https://github.com/inversify/InversifyJS/blob/master/wiki/auto_factory.md)
- [Injecting a Provider (asynchronous Factory)](https://github.com/inversify/InversifyJS/blob/master/wiki/provider_injection.md)
- [Activation handler](https://github.com/inversify/InversifyJS/blob/master/wiki/activation_handler.md)
- [Middleware](https://github.com/inversify/InversifyJS/blob/master/wiki/middleware.md)
- [Multi-injection](https://github.com/inversify/InversifyJS/blob/master/wiki/multi_injection.md)
- [Tagged bindings](https://github.com/inversify/InversifyJS/blob/master/wiki/tagged_bindings.md)
- [Create your own tag decorators](https://github.com/inversify/InversifyJS/blob/master/wiki/custom_tag_decorators.md)
- [Named bindings](https://github.com/inversify/InversifyJS/blob/master/wiki/named_bindings.md)
- [Kernel.getAll<T>(), Kernel.getNamed<T>() & Kernel.getTagged<T>()](https://github.com/inversify/InversifyJS/blob/master/wiki/get_all_named_tagged.md)
- [Contextual bindings & @targetName](https://github.com/inversify/InversifyJS/blob/master/wiki/contextual_bindings.md)
- [Property injection](https://github.com/inversify/InversifyJS/blob/master/wiki/property_injection.md)
- [Circular dependencies](https://github.com/inversify/InversifyJS/blob/master/wiki/circular_dependencies.md)
- [Inheritance](https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md)

Please refer to the [wiki](https://github.com/inversify/InversifyJS/blob/master/wiki/readme.md) for additional details.

### Ecosystem
In order to provide a state of the art development experience we are also working on a series of middleware extensions and other development tools. 

Please refer to the [ecosystem page on the wiki](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md) to learn more about it.

### Examples
Some integration examples are available in the [official examples repository](https://github.com/inversify/Inversify-code-samples).

### Support
If you are experience any kind of issues we will be happy to help. You can report an issue using the [issues page](https://github.com/inversify/InversifyJS/issues) or the [chat](https://gitter.im/inversify/InversifyJS). You can also ask questions at [Stack overflow](http://stackoverflow.com/tags/inversifyjs) using the `inversifyjs` tag.

If you want to share your thoughts with the development team or join us you will be able to do so using the [official the mailing list](https://groups.google.com/forum/#!forum/inversifyjs). You can check out the
[wiki](https://github.com/inversify/InversifyJS/blob/master/wiki/readme.md) and browse the [documented source code](http://inversify.io/documentation/index.html) to learn more about InversifyJS internals.

### Acknowledgements

Thanks a lot to all the [contributors](https://github.com/inversify/InversifyJS/graphs/contributors), all the developers out there using InversifyJS and all those that help us to spread the word by sharing content about InversifyJS online. Without your feedback and support this project would not be possible.

### License

License under the MIT License (MIT)

Copyright © 2015 [Remo H. Jansen](http://www.remojansen.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 

IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
