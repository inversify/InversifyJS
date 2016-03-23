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

### About
InversifyJS is a lightweight (4KB) pico inversion of control (IoC) container for TypeScript and JavaScript apps.
A pico IoC container uses a class constructor to identify and inject its dependencies.
InversifyJS has a friendly API and encourage the usage of the best OOP and IoC practices.

### Motivation
JavaScript applications are becoming larger and larger day after day.
InversifyJS has been designed to allow JavaScript developers to write code that adheres to the SOLID principles.

### Philosophy
InversifyJS has been developed with 3 main goals:

1. Allow JavaScript developers to write code that adheres to the SOLID principles.

2. Facilitate and encourage the adherence to the best OOP and IoC practices.

3. Add as little runtime overhead as possible.

### Installation

You can get the latest release and the type definitions using npm:
```sh
npm install inversify@2.0.0-alpha.3 --save
```
> **Note**: We have decided to [drop support for bower](https://twitter.com/nachocoloma/status/663622545162280960) and tsd.

The InversifyJS type definitions are included in the npm package:

```ts
/// <reference path="node_modules/inversify/type_definitions/inversify/inversify.d.ts" />
```
> **Note**: InversifyJS requires a modern JavaScript engine with support for the Promise, Reflect (with metadata) and Proxy objects. If your environment don't support one of these you will need to import a shim or polypill. Check out the [Environment support and polyfills](https://github.com/inversify/InversifyJS/wiki/Environmemt-support-and-polyfills) page in the wiki to learn more.

### The Basics (TypeScript)
Let’s take a look to the basic usage and APIs of InversifyJS with TypeScript:

#### Step 1: Declare your interfaces
Our goal is to write code that adheres to the [dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle). 
This means that we should "depend upon Abstractions and do not depend upon concretions". 
Let's start by declaring some interfaces (abstractions).

```ts
interface INinja {
    fight(): string;
    sneak(): string;
}

interface IKatana {
    hit(): string;
}

interface IShuriken {
    throw();
}
```

#### Step 2: Implement the interfaces and declare dependencies using the `@injectable` decorator
Let's continue by declaring some classes (concretions). The classes are implementations of the interfaces that we just declared.
```ts
import { injectable } from "inversify";

class Katana implements IKatana {
    public hit() {
        return "cut!";
    }
}

class Shuriken implements IShuriken {
    public throw() {
        return "hit!";
    }
}

@injectable("IKatana", "IShuriken")
class Ninja implements INinja {

    private _katana: IKatana;
    private _shuriken: IShuriken;

    public constructor(katana: IKatana, shuriken: IShuriken) {
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
kernel.bind<INinja>("INinja").to(Ninja);
kernel.bind<IKatana>("IKatana").to(Katana);
kernel.bind<IShuriken>("IShuriken").to(Shuriken);

export default kernel;
```

#### Step 4: Resolve dependencies
You can use the method `get<T>` from the `Kernel` class to resolve a dependency.
Remember that you should do this only in your [composition root](http://blog.ploeh.dk/2011/07/28/CompositionRoot/)
to avoid the [service locator anti-pattern](http://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/).

```ts
import kernel = from "./inversify.config";

var ninja = kernel.get<INinja>("INinja");

expect(ninja.fight()).eql("cut!"); // true
expect(ninja.sneak()).eql("hit!"); // true
```

As we can see the `IKatana` and `IShuriken` were successfully resolved and injected into `Ninja`.

### The Basics (JavaScript)
It is recommended to use TypeScript for the best development experience but you can use plain JavaScript
if you preffer it. The following code snippet implements the previous example without TypeScript in Node.js v5.71: 

```ts
var inversify = require("inversify");
require("reflect-metadata");

var TYPES = {
    Ninja: "Ninja",
    Katana: "Katana",
    Shuriken: "Shuriken"
};

class Katana {
    hit() {
        return "cut!";
    }
}

class Shuriken {
    throw() {
        return "hit!";
    }
}

class Ninja {
    constructor(katana, shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
    }
    fight() { return this._katana.hit(); };
    sneak() { return this._shuriken.throw(); };
}

// Declare as injectable and its dependencies
inversify.injectable(TYPES.Katana, TYPES.Shuriken)(Ninja);

// Declare bindings
var kernel = new inversify.Kernel();
kernel.bind(TYPES.Ninja).to(Ninja);
kernel.bind(TYPES.Katana).to(Katana);
kernel.bind(TYPES.Shuriken).to(Shuriken);

// Resolve dependencies
var ninja = kernel.get(TYPES.Ninja);
return ninja;
```

### Features (v2.0.0-alpha.6)
Let's take a look to the InversifyJS features!

#### Declaring kernel modules

Kernel modules can help you to manage the complexity of your bindings in very large applications.
```ts
let warriors: IKernelModule = (k: IKernel) => {
    k.bind<INinja>("INinja").to(Ninja);
};

let weapons: IKernelModule = (k: IKernel) => {
    k.bind<IKatana>("IKatana").to(Katana).inTransientScope();
    k.bind<IShuriken>("IShuriken").to(Shuriken).inSingletonScope();
};

kernel = new Kernel();
kernel.load(warriors, weapons);
```

#### Controlling the scope of the dependencies

InversifyJS uses transient scope by default but you can also use singleton scope:
```ts
kernel.bind<IShuriken>("IShuriken").to(Shuriken).inTransientScope(); // Default
kernel.bind<IShuriken>("IShuriken").to(Shuriken).inSingletonScope();
```

#### Injecting a value
Binds an abstraction to a constant value.
```ts
kernel.bind<IKatana>("IKatana").toValue(new Katana());
```

#### Injecting a class constructor
Binds an abstraction to a class constructor.
```ts
@injectable("IKatana", "IShuriken")
class Ninja implements INinja {

    private _katana: IKatana;
    private _shuriken: IShuriken;

    public constructor(Katana: INewable<IKatana>, shuriken: IShuriken) {
        this._katana = new Katana();
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

```ts
kernel.bind<INewable<IKatana>>("INewable<IKatana>").toConstructor<IKatana>(Katana);
```

#### Injecting a Factory
Binds an abstraction to a user defined Factory.
```ts
@injectable("IKatana", "IShuriken")
class Ninja implements INinja {

    private _katana: IKatana;
    private _shuriken: IShuriken;

    public constructor(katanaFactory: IFactory<IKatana>, shuriken: IShuriken) {
        this._katana = katanaFactory();
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

```ts
kernel.bind<IFactory<IKatana>>("IFactory<IKatana>").toFactory<IKatana>((context) => {
    return () => {
        return context.kernel.get<IKatana>("IKatana");
    };
});
```

#### Auto factory
Binds an abstraction to a auto-generated Factory.
```ts
@injectable("IKatana", "IShuriken")
class Ninja implements INinja {

    private _katana: IKatana;
    private _shuriken: IShuriken;

    public constructor(katanaFactory: IFactory<IKatana>, shuriken: IShuriken) {
        this._katana = katanaFactory();
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

```ts
kernel.bind<IFactory<IKatana>>("IFactory<IKatana>").toAutoFactory<IKatana>();
```

#### Injecting a Provider (asynchronous Factory)
Binds an abstraction to a Provider. A provider is an asynchronous factory, this is useful when dealing with asynchronous  I/O operations.
```ts
@injectable("IKatana", "IShuriken")
class Ninja implements INinja {

    public katana: IKatana;
    public shuriken: IShuriken;
    public katanaProvider: IProvider<IKatana>;

    public constructor(katanaProvider: IProvider<IKatana>, shuriken: IShuriken) {
        this.katanaProvider = katanaProvider;
        this.katana= null;
        this.shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}

var ninja = kernel.get<INinja>("INinja");

ninja.katanaProvider()
     .then((katana) => { ninja.katana = katana; })
     .catch((e) => { console.log(e); });
```

```ts
kernel.bind<IProvider<IKatana>>("IProvider<IKatana>").toProvider<IKatana>((context) => {
    return () => {
        return new Promise<IKatana>((resolve) => {
            let katana = context.kernel.get<IKatana>("IKatana");
            resolve(katana);
        });
    };
});
```

#### Activation handler
It is possible to add an activation handler for a type. The activation handler is invoked after a dependency has been resolved
and before it is added to the cache (if singleton) and injected. This is useful to keep our dependencies agnostic of the 
implementation of crosscutting concerns like caching or logging. The following example uses a 
[proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to incercept one of the methods
(`use`) of a dependency (`IKatana`).

```ts
interface IKatana {
    use: () => void;
}

class Katana implements IKatana {
    public use() {
        console.log("Used Katana!");
    }
}

interface INinja {
    katana: IKatana;
}

@injectable("IKatana")
class Ninja implements INinja {
    public katana: IKatana;
    public constructor(katana: IKatana) {
        this.katana = katana;
    }
}
```

```ts
kernel.bind<INinja>("INinja").to(Ninja);

kernel.bind<IKatana>("IKatana").to(Katana).onActivation((context, katana) => {
    let handler = {
        apply: function(target, thisArgument, argumentsList) {
            console.log(`Starting: ${new Date().getTime()}`);
            let result = target.apply(thisArgument, argumentsList);
            console.log(`Finished: ${new Date().getTime()}`);
            return result;
        }
    };
    katana.use = new Proxy(katana.use, handler);
    return katana;
});
```

```ts
let ninja = kernelget<INinja>();
ninja.katana.use();
> Starting: 1457895135761
> Used Katana!
> Finished: 1457895135762
```

#### Middleware
InversifyJS performs **3 mandatory operations** before resolving a dependency: 

- **Annotation**
- **Planning**
- **Middleware (optional)**
- **Resolution**
- **Activation (optional)**

In some cases there will be some **additional operations (middleware & activation)**.

If we have configured some Middleware it will be executed just before the 
[resolution phase](https://github.com/inversify/InversifyJS/wiki/Architecture-overview) takes place. 

Middleware can be used to implement powerful development tools. 
This kind of tools will help developers to identify problems during the development process.

```ts
function logger(next: (context: IContext) => any) {
    return (context: IContext) => {
        let result = next(context);
        console.log("CONTEXT: ", context);
        console.log("RESULT: ", result);
        return result;
    };
};

function devTools(next: (context: IContext) => any) {
    return (context: IContext) => {
        let result = next(context);
        let _window: any = window;
        let __inversify_devtools__ = _window.__inversify_devtools__;
        if (__inversify_devtools__ !== undefined) { __inversify_devtools__.log(context, result); }
        return result;
    };
};
```
Now that we have declared two middlewares we can create a new `Kernel` and 
use its `applyMiddleware` method to apply them,
```ts
interface INinja {}
class Ninja implements INinja {}

let kernel = new Kernel();
kernel.bind<INinja>("INinja").to(Ninja);

kernel.applyMiddleware(logger, devTools);
```
The `logger` middleware will log in console the context and result. The `crashReporter` middleware
is not invoked because `__inversify_devtools__` is undefined.
```ts
let ninja = kernel.get<INinja>("INinja");
> CONTEXT:  Context {
  kernel: 
   Kernel {
     _planner: Planner {},
     _resolver: Resolver {},
     _bindingDictionary: Lookup { _dictionary: [Object] },
     _middleware: [Function] },
  plan: 
   Plan {
     parentContext: [Circular],
     rootRequest: 
      Request {
        guid: '9b5d5435-d784-c9e2-c666-5b5e2cf98221',
        service: 'INinja',
        parentContext: [Circular],
        parentRequest: null,
        target: null,
        childRequests: [],
        bindings: [Object] } } }
> RESULT:  Ninja {}
```

#### Multi-injection
We can use multi-injection When two or more concretions have been bound to the an abstraction.
Notice how an array of `IWeapon` is injected into the `Ninja` class via its constructor:
```ts
interface IWeapon {
    name: string;
}

class Katana implements IWeapon {
    public name = "Katana";
}
class Shuriken implements IWeapon {
    public name = "Shuriken";
}

interface INinja {
    katana: IWeapon;
    shuriken: IWeapon;
}

@injectable("IWeapon[]")
class Ninja implements INinja {
    public katana: IWeapon;
    public shuriken: IWeapon;
    public constructor(weapons: IWeapon[]) {
        this.katana = weapons[0];
        this.shuriken = weapons[1];
    }
}
```

We are binding `Katana` and `Shuriken` to `IWeapon`:

```ts
kernel.bind<INinja>("INinja").to(Ninja);
kernel.bind<IWeapon>("IWeapon").to(Katana);
kernel.bind<IWeapon>("IWeapon").to(Shuriken);
```

#### Tagged bindings
We can use tagged bindings to fix `AMBIGUOUS_MATCH` errors when two or more
concretions have been bound to the an abstraction. Notice how the  constructor
arguments of the `Ninja` class have been annotated using the `@tagged` decorator:
```ts
interface IWeapon {}
class Katana implements IWeapon { }
class Shuriken implements IWeapon {}

interface INinja {
    katana: IWeapon;
    shuriken: IWeapon;
}

@injectable("IWeapon", "IWeapon")
class Ninja implements INinja {
    public katana: IWeapon;
    public shuriken: IWeapon;
    public constructor(
        @tagged("canThrow", false) katana: IWeapon,
        @tagged("canThrow", true) shuriken: IWeapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

We are binding `Katana` and `Shuriken` to `IWeapon` but a `whenTargetTagged`
constraint is added to avoid `AMBIGUOUS_MATCH` errors:

```ts
kernel.bind<INinja>(ninjaId).to(Ninja);
kernel.bind<IWeapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
kernel.bind<IWeapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);
```

#### Create your own tag decorators

Creating your own decorators is really simple:

```ts
let throwable = tagged("canThrow", true);
let notThrowable = tagged("canThrow", false);

@injectable("IWeapon", "IWeapon")
class Ninja implements INinja {
    public katana: IWeapon;
    public shuriken: IWeapon;
    public constructor(
        @notThrowable katana: IWeapon,
        @throwable shuriken: IWeapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

#### Named bindings
We can use named bindings to fix `AMBIGUOUS_MATCH` errors when two or more concretions have
been bound to the an abstraction. Notice how the constructor arguments of the `Ninja` class
have been annotated using the `@named` decorator:
```ts
interface IWeapon {}
class Katana implements IWeapon { }
class Shuriken implements IWeapon {}

interface INinja {
    katana: IWeapon;
    shuriken: IWeapon;
}

@injectable("IWeapon", "IWeapon")
class Ninja implements INinja {
    public katana: IWeapon;
    public shuriken: IWeapon;
    public constructor(
        @named("strong")katana: IWeapon,
        @named("weak") shuriken: IWeapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```
We are binding `Katana` and `Shuriken` to `IWeapon` but a `whenTargetNamed` constraint is
added to avoid `AMBIGUOUS_MATCH` errors:
```ts
kernel.bind<INinja>("INinja").to(Ninja);
kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetNamed("strong");
kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetNamed("weak");
```

#### Contextual bindings & @paramNames
The `@paramNames` decorator is used to access the names of the constructor arguments from a
contextual constraint even when the code is compressed. The `constructor(katana, shuriken) { ...`
becomes `constructor(a, b) { ...` after compression but thanks to `@paramNames` we can still
refer to the design-time names `katana` and `shuriken`.
```ts
interface IWeapon {}
class Katana implements IWeapon { }
class Shuriken implements IWeapon {}

interface INinja {
    katana: IWeapon;
    shuriken: IWeapon;
}

@injectable("IWeapon", "IWeapon")
@paramNames("katana","shuriken")
class Ninja implements INinja {
    public katana: IWeapon;
    public shuriken: IWeapon;
    public constructor(
        katana: IWeapon,
        shuriken: IWeapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```
We are binding `Katana` and `Shuriken` to `IWeapon` but a custom `when` constraint is added to avoid `AMBIGUOUS_MATCH` errors:
```ts
kernel.bind<INinja>(ninjaId).to(Ninja);

kernel.bind<IWeapon>("IWeapon").to(Katana).when((request: IRequest) => {
    return request.target.name.equals("katana");
});

kernel.bind<IWeapon>("IWeapon").to(Shuriken).when((request: IRequest) => {
    return request.target.name.equals("shuriken");
});
```
The target fields implement the `IQueryableString` interface to help you to create your custom constraints:
```ts
interface IQueryableString {
  startsWith(searchString: string): boolean;
  endsWith(searchString: string): boolean;
  contains(searchString: string): boolean;
  equals(compareString: string): boolean;
  value(): string;
}
```

#### Circular dependencies
InversifyJS is able to identify circular dependencies and will throw an exception to help you to
identify the location of the problem if a circular dependency is detected:

```
Error: Circular dependency found between services: IKatana and INinja
```

Plese refer to the [wiki](https://github.com/inversify/InversifyJS/wiki) for additional details.

### Live demo & examples
You can try InversifyJS online at [tonicdev.com](https://tonicdev.com/remojansen/inversify-2.0.0-alpha.3). Some integration examples are available in the [official examples repository](https://github.com/inversify/Inversify-code-samples).

### Testimonies

**[Nate Kohari](https://twitter.com/nkohari)** - Author of [Ninject](https://github.com/ninject/Ninject)

> *"Ninject author here. Nice work! I've taken a couple shots at creating DI frameworks for JavaScript and TypeScript, but the lack of RTTI really hinders things.* 
> *The ES7 metadata gets us part of the way there (as you've discovered). Keep up the great work!"*

### Support
If you are experience any kind of issues we will be happy to help. You can report an issue using the
[issues page](https://github.com/inversify/InversifyJS/issues) or the
[chat](https://gitter.im/inversify/InversifyJS). You can also ask questions at
[Stack overflow](http://stackoverflow.com/tags/inversifyjs) using the `inversifyjs` tag.

If you want to share your thoughts with the development team or join us you will be able to do so using the
[official the mailing list](https://groups.google.com/forum/#!forum/inversifyjs). You can check out the
[development wiki](https://github.com/inversify/InversifyJS/wiki) and browse the
[documented source code](http://inversify.io/documentation/index.html) to learn more about InversifyJS internals.

### License

License under the MIT License (MIT)

Copyright © 2015 [Remo H. Jansen](http://www.remojansen.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without
limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
