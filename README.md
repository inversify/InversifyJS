# InversifyJS

[![Join the chat at https://gitter.im/inversify/InversifyJS](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/inversify/InversifyJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://secure.travis-ci.org/inversify/InversifyJS.svg?branch=master)](https://travis-ci.org/inversify/InversifyJS)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/cd9ekn86p8y2t7h4/branch/master?svg=true)](https://ci.appveyor.com/project/remojansen/inversifyjs/branch/master)
[![Test Coverage](https://codeclimate.com/github/inversify/InversifyJS/badges/coverage.svg)](https://codeclimate.com/github/inversify/InversifyJS/coverage)
[![npm version](https://badge.fury.io/js/inversify.svg)](http://badge.fury.io/js/inversify)
[![Dependencies](https://david-dm.org/inversify/InversifyJS.svg)](https://david-dm.org/inversify/InversifyJS#info=dependencies)
[![img](https://david-dm.org/inversify/InversifyJS/dev-status.svg)](https://david-dm.org/inversify/InversifyJS/#info=devDependencies)
[![img](https://david-dm.org/inversify/InversifyJS/peer-status.svg)](https://david-dm.org/inversify/InversifyJS/#info=peerDependenciess)
[![Known Vulnerabilities](https://snyk.io/test/github/inversify/InversifyJS/badge.svg)](https://snyk.io/test/github/inversify/InversifyJS)
[![Twitter Follow](https://img.shields.io/twitter/follow/InversifyJS.svg?style=flat&maxAge=86400)](https://twitter.com/inversifyjs)

[![NPM](https://nodei.co/npm/inversify.png?downloads=true&downloadRank=true)](https://nodei.co/npm/inversify/)
[![NPM](https://nodei.co/npm-dl/inversify.png?months=9&height=3)](https://nodei.co/npm/inversify/)

![](https://raw.githubusercontent.com/inversify/inversify.github.io/master/img/cover.jpg)

A powerful and lightweight inversion of control container for JavaScript & Node.js apps powered by TypeScript.

## About
InversifyJS is a lightweight (4KB) inversion of control (IoC) container for TypeScript and JavaScript apps.
A IoC container uses a class constructor to identify and inject its dependencies.
InversifyJS has a friendly API and encourage the usage of the best OOP and IoC practices.

## Motivation
JavaScript now supports object oriented (OO) programming with class based inheritance. These features are great but the truth is that they are also
[dangerous](https://medium.com/@dan_abramov/how-to-use-classes-and-sleep-at-night-9af8de78ccb4).

We need a good OO design ([SOLID](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)), [Composite Reuse](https://en.wikipedia.org/wiki/Composition_over_inheritance), etc.) to protect ourselves from these threats. The problem is that OO design is difficult and that is exactly why we created InversifyJS.

InversifyJS is a tool that helps JavaScript developers to write code with a good OO design.

## Philosophy
InversifyJS has been developed with 4 main goals:

1. Allow JavaScript developers to write code that adheres to the SOLID principles.

2. Facilitate and encourage the adherence to the best OOP and IoC practices.

3. Add as little runtime overhead as possible.

4. Provide a [state of the art development experience](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md).

## Testimonies

**[Nate Kohari](https://twitter.com/nkohari)** - Author of [Ninject](https://github.com/ninject/Ninject)

> *"Nice work! I've taken a couple shots at creating DI frameworks for JavaScript and TypeScript, but the lack of RTTI really hinders things.* 
> *The ES7 metadata gets us part of the way there (as you've discovered). Keep up the great work!"*

**[Michel Weststrate](https://twitter.com/mweststrate)** - Author of [MobX](https://github.com/mobxjs/mobx)
> *Dependency injection like InversifyJS works nicely*

## Installation

You can get the latest release and the type definitions using npm:

```
$ npm install inversify reflect-metadata --save
```

The InversifyJS type definitions are included in the inversify npm package. 

> :warning: **Important!** InversifyJS requires TypeScript >= 2.0 and the `experimentalDecorators`, `emitDecoratorMetadata`, `types` and `lib` 
compilation options in your `tsconfig.json` file.

```js
{
    "compilerOptions": {
        "target": "es5",
        "lib": ["es6"],
        "types": ["reflect-metadata"],
        "module": "commonjs",
        "moduleResolution": "node",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

InversifyJS requires a modern JavaScript engine with support for:

- [Reflect metadata](https://rbuckton.github.io/reflect-metadata/)
- [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) (Only required if using [provider injection](https://github.com/inversify/InversifyJS/blob/master/wiki/provider_injection.md))
- [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) (Only required if using [activation handlers](https://github.com/inversify/InversifyJS/blob/master/wiki/activation_handler.md))

If your environment don't support one of these you will need to import a shim or polyfill.

> :warning: **The `reflect-metadata` polyfill should be imported only once in your entire application** because the Reflect object is mean to be a global singleton. More details about this can be found [here](https://github.com/inversify/InversifyJS/issues/262#issuecomment-227593844).

Check out the [Environment support and polyfills](https://github.com/inversify/InversifyJS/blob/master/wiki/environment.md)
page in the wiki and the [Basic example](https://github.com/inversify/inversify-basic-example) to learn more.

## The Basics
Let’s take a look to the basic usage and APIs of InversifyJS with TypeScript:

### Step 1: Declare your interfaces and types

Our goal is to write code that adheres to the [dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle). 
This means that we should "depend upon Abstractions and do not depend upon concretions". 
Let's start by declaring some interfaces (abstractions).

```ts
interface Warrior {
    fight(): string;
    sneak(): string;
}

interface Weapon {
    hit(): string;
}

interface ThrowableWeapon {
    throw(): string;
}
```

InversifyJS need to use the type as identifiers at runtime. We use symbols as identifiers but you can also use classes and or string literals.
 
```ts
let TYPES = {
    Warrior: Symbol("Warrior"),
    Weapon: Symbol("Weapon"),
    ThrowableWeapon: Symbol("ThrowableWeapon")
};

export { TYPES };

```

> **Note**: It is recommended to use Symbols but InversifyJS also support the usage of Classes and string literals (please refer to the features section to learn more).

### Step 2: Declare dependencies using the `@injectable` & `@inject` decorators
Let's continue by declaring some classes (concretions). The classes are implementations of the interfaces that we just declared. All the classes must be annotated with the `@injectable` decorator. 

When a class has a  dependency on an interface we also need to use the `@inject` decorator to define an identifier for the interface that will be available at runtime. In this case we will use the Symbols `Symbol("Weapon")` and `Symbol("ThrowableWeapon")` as runtime identifiers.

```ts
import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";

@injectable()
class Katana implements Weapon {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Shuriken implements ThrowableWeapon {
    public throw() {
        return "hit!";
    }
}

@injectable()
class Ninja implements Warrior {

    private _katana: Weapon;
    private _shuriken: ThrowableWeapon;

    public constructor(
	    @inject(TYPES.Weapon) katana: Weapon,
	    @inject(TYPES.ThrowableWeapon) shuriken: ThrowableWeapon
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); }
    public sneak() { return this._shuriken.throw(); }

}

export { Ninja, Katana, Shuriken };
```

If you prefer it you can use property injection instead of constructor injection so you don't have to declare the class constructor:

```ts
@injectable()
class Ninja implements Warrior {
    @inject(TYPES.Weapon) private _katana: Weapon;
    @inject(TYPES.ThrowableWeapon) private _shuriken: ThrowableWeapon;
    public fight() { return this._katana.hit(); }
    public sneak() { return this._shuriken.throw(); }
}
```

### Step 3: Create and configure a Container
We recommend to do this in a file named `inversify.config.ts`. This is the only place in which there is some coupling.
In the rest of your application your classes should be free of references to other classes.
```ts
import { Container } from "inversify";
import TYPES from "./types";
import { Ninja, Katana, Shuriken } from "./entities";

var myContainer = new Container();
myContainer.bind<Warrior>(TYPES.Warrior).to(Ninja);
myContainer.bind<Weapon>(TYPES.Weapon).to(Katana);
myContainer.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken);

export { myContainer };
```

### Step 4: Resolve dependencies
You can use the method `get<T>` from the `Container` class to resolve a dependency.
Remember that you should do this only in your [composition root](http://blog.ploeh.dk/2011/07/28/CompositionRoot/)
to avoid the [service locator anti-pattern](http://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/).

```ts
import { myContainer } from "./inversify.config";

var ninja = myContainer.get<Warrior>(TYPES.Warrior);

expect(ninja.fight()).eql("cut!"); // true
expect(ninja.sneak()).eql("hit!"); // true
```

As we can see the `Katana` and `Shuriken` were successfully resolved and injected into `Ninja`.

InversifyJS supports ES5 and ES6 and can work without TypeScript.
Head to the [**JavaScript example**](https://github.com/inversify/InversifyJS/blob/master/wiki/basic_js_example.md) to learn more!

## The InversifyJS Features and API
Let's take a look to the InversifyJS features!

- [Support for classes](https://github.com/inversify/InversifyJS/blob/master/wiki/classes_as_id.md)
- [Support for Symbols](https://github.com/inversify/InversifyJS/blob/master/wiki/symbols_as_id.md)
- [Container API](https://github.com/inversify/InversifyJS/blob/master/wiki/container_api.md)
- [Declaring container modules](https://github.com/inversify/InversifyJS/blob/master/wiki/container_modules.md)
- [Container snapshots](https://github.com/inversify/InversifyJS/blob/master/wiki/container_snapshots.md)
- [Controlling the scope of the dependencies](https://github.com/inversify/InversifyJS/blob/master/wiki/scope.md)
- [Declaring optional dependencies](https://github.com/inversify/InversifyJS/blob/master/wiki/optional_dependencies.md)
- [Injecting a constant or dynamic value](https://github.com/inversify/InversifyJS/blob/master/wiki/value_injection.md)
- [Injecting a class constructor](https://github.com/inversify/InversifyJS/blob/master/wiki/constructor_injection.md)
- [Injecting a Factory](https://github.com/inversify/InversifyJS/blob/master/wiki/factory_injection.md)
- [Auto factory](https://github.com/inversify/InversifyJS/blob/master/wiki/auto_factory.md)
- [Injecting a Provider (asynchronous Factory)](https://github.com/inversify/InversifyJS/blob/master/wiki/provider_injection.md)
- [Activation handler](https://github.com/inversify/InversifyJS/blob/master/wiki/activation_handler.md)
- [Post Construct decorator](https://github.com/inversify/InversifyJS/blob/master/wiki/post_construct.md)
- [Middleware](https://github.com/inversify/InversifyJS/blob/master/wiki/middleware.md)
- [Multi-injection](https://github.com/inversify/InversifyJS/blob/master/wiki/multi_injection.md)
- [Tagged bindings](https://github.com/inversify/InversifyJS/blob/master/wiki/tagged_bindings.md)
- [Create your own tag decorators](https://github.com/inversify/InversifyJS/blob/master/wiki/custom_tag_decorators.md)
- [Named bindings](https://github.com/inversify/InversifyJS/blob/master/wiki/named_bindings.md)
- [Default target](https://github.com/inversify/InversifyJS/blob/master/wiki/default_targets.md)
- [Support for hierarchical DI systems](https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md)
- [Contextual bindings & @targetName](https://github.com/inversify/InversifyJS/blob/master/wiki/contextual_bindings.md)
- [Property injection](https://github.com/inversify/InversifyJS/blob/master/wiki/property_injection.md)
- [Circular dependencies](https://github.com/inversify/InversifyJS/blob/master/wiki/circular_dependencies.md)
- [Inheritance](https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md)

Please refer to the [wiki](https://github.com/inversify/InversifyJS/blob/master/wiki/readme.md) for additional details.

## Ecosystem
In order to provide a state of the art development experience we are also working on:

- [Middleware extensions](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md#extensions).
- [Development tools](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md#development-tools).
- [Examples](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md#examples).

Please refer to the [ecosystem wiki page](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md) to learn more.

## Support
If you are experience any kind of issues we will be happy to help. You can report an issue using the [issues page](https://github.com/inversify/InversifyJS/issues) or the [chat](https://gitter.im/inversify/InversifyJS). You can also ask questions at [Stack overflow](http://stackoverflow.com/tags/inversifyjs) using the `inversifyjs` tag.

If you want to share your thoughts with the development team or join us you will be able to do so using the [official the mailing list](https://groups.google.com/forum/#!forum/inversifyjs). You can check out the
[wiki](https://github.com/inversify/InversifyJS/blob/master/wiki/readme.md) to learn more about InversifyJS internals.

## Acknowledgements

Thanks a lot to all the [contributors](https://github.com/inversify/InversifyJS/graphs/contributors), all the developers out there using InversifyJS and all those that help us to spread the word by sharing content about InversifyJS online. Without your feedback and support this project would not be possible.

## License

License under the MIT License (MIT)

Copyright © 2015-2016 [Remo H. Jansen](http://www.remojansen.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 

IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
