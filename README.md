![](https://raw.githubusercontent.com/inversify/inversify.github.io/master/img/cover.jpg)

<p align="center">
  <a href="https://www.npmjs.com/package/inversify" target="__blank"><img src="https://img.shields.io/npm/v/inversify?color=0476bc&label=" alt="NPM version"></a>
  <a href="https://www.npmjs.com/package/inversify" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/inversify?color=3890aa&label="></a>
  <a href="https://github.com/inversify/InversifyJS#-the-inversifyjs-features-and-api" target="__blank"><img src="https://img.shields.io/static/v1?label=&message=docs&color=1e8a7a" alt="Docs"></a>
  <a href="https://codecov.io/gh/inversify/InversifyJS" target="__blank"><img alt="Codecov" src="https://codecov.io/gh/inversify/InversifyJS/branch/master/graph/badge.svg?token=KfAKzuGs01"></a>
  <br>
  <br>
  <a href="https://github.com/inversify/InversifyJS" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/inversify/InversifyJS?style=social"></a>
  <!--<a href="https://twitter.com/inversifyjs" target="__blank"><img alt="Twitter" src="https://img.shields.io/twitter/follow/InversifyJS.svg?maxAge=86400&style=social"></a>-->
  <a href="https://discord.gg/jXcMagAPnm" target="__blank"><img alt="Discord Server" src="https://img.shields.io/discord/816766547879657532?style=social&logo=discord"></a>
</p>

# InversifyJS
A powerful and lightweight inversion of control container for JavaScript & Node.js apps powered by TypeScript.

## About
InversifyJS is a lightweight inversion of control (IoC) container for TypeScript and JavaScript apps.
An IoC container uses a class constructor to identify and inject its dependencies.
InversifyJS has a friendly API and encourages the usage of the best OOP and IoC practices.

## Motivation
JavaScript now supports object oriented (OO) programming with class based inheritance. These features are great but the truth is that they are also
[dangerous](https://medium.com/@dan_abramov/how-to-use-classes-and-sleep-at-night-9af8de78ccb4).

We need a good OO design ([SOLID](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)), [Composite Reuse](https://en.wikipedia.org/wiki/Composition_over_inheritance), etc.) to protect ourselves from these threats. The problem is that OO design is difficult and that is exactly why we created InversifyJS.

InversifyJS is a tool that helps JavaScript developers write code with good OO design.

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

## Some companies using InversifyJS

[<img src="https://avatars0.githubusercontent.com/u/6154722?s=200&v=4" width="100" />](https://opensource.microsoft.com/)[<img src="https://avatars2.githubusercontent.com/u/69631?s=200&v=4" width="100" />](https://code.facebook.com/projects/1021334114569758/nuclide/)[<img src="https://avatars0.githubusercontent.com/u/2232217?s=200&v=4" width="100" />](https://aws.github.io/aws-amplify/)[<img src="https://avatars0.githubusercontent.com/u/1520648?s=200&v=4" width="100" />](https://www.plainconcepts.com/)[<img src="https://avatars3.githubusercontent.com/u/6962987?s=200&v=4" width="100" />](https://api.slack.com/)[<img src="https://pbs.twimg.com/profile_images/827249559046909954/SyaBPcH8_400x400.jpg" width="100" />](http://acia.aon.com/index.php/home/) [<img src="https://avatars3.githubusercontent.com/u/114767?s=200&v=4" width="100" />](https://www.lonelyplanet.com/) [<img src="https://avatars0.githubusercontent.com/u/25283328?s=200&v=4" width="100" />](https://jincor.com/) [<img src="https://avatars1.githubusercontent.com/u/1957282?s=200&v=4" width="100" />](https://www.web-computing.de/) [<img src="https://avatars1.githubusercontent.com/u/17648048?s=200&v=4" width="100" />](https://dcos.io/) [<img src="https://avatars0.githubusercontent.com/u/16970371?s=200&v=4" width="100" />](https://typefox.io/) [<img src="https://avatars0.githubusercontent.com/u/18010308?s=200&v=4" width="100" />](https://code4.ro/) [<img src="https://user-images.githubusercontent.com/10656223/33888109-fae0852e-df43-11e7-97f6-9db543da0bde.png" width="100">](http://www.baidu.com/) [<img src="https://avatars2.githubusercontent.com/u/8085382?s=200&v=4" width="100" />](https://www.imdada.cn/) [<img src="https://avatars2.githubusercontent.com/u/17041151?s=200&v=4" width="100" />](https://www.ato.gov.au/) [<img src="https://avatars1.githubusercontent.com/u/14963540?s=200&v=4" width="100" />](https://www.kaneoh.com/) [<img src="https://avatars0.githubusercontent.com/u/26021686?s=200&v=4" width="100" />](https://particl.io/) [<img src="https://avatars2.githubusercontent.com/u/24523195?s=200&v=4" width="100" />](https://slackmap.com/) [<img src="https://avatars3.githubusercontent.com/u/16556899?s=200&v=4" width="100" />](https://www.go1.com/) [<img src="https://avatars3.githubusercontent.com/u/23475730?s=200&v=4" width="100" />](http://www.stellwagengroup.com/stellwagen-technology/) [<img src="https://avatars1.githubusercontent.com/u/15262567?s=200&v=4" width="100" />](https://www.edrlab.org/) [<img src="https://avatars1.githubusercontent.com/u/10072104?s=200&v=4" width="100" />](https://www.goodgamestudios.com/) [<img src="https://avatars2.githubusercontent.com/u/13613760?s=200&v=4" width="100" />](https://freshfox.at/) [<img src="https://avatars1.githubusercontent.com/u/864482?s=200&v=4" width="100" />](https://schubergphilis.com/)

## 📦 Installation

You can get the latest release and the type definitions using your preferred package manager:

```sh
> npm install inversify reflect-metadata --save
> yarn add inversify reflect-metadata
> pnpm add inversify reflect-metadata
```

> ❕**Hint!** If you want to use a more type-safe version of reflect-metadata, try [`@abraham/reflection`](https://www.npmjs.com/package/@abraham/reflection)

The InversifyJS type definitions are included in the inversify npm package.

> :warning: **Important!** InversifyJS requires TypeScript >= 4.4 and the `experimentalDecorators`, `emitDecoratorMetadata`, `types` and `lib`
compilation options in your `tsconfig.json` file.

```json
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

If your environment doesn't support one of these you will need to import a shim or polyfill.

> :warning: **The `reflect-metadata` polyfill should be imported only once in your entire application** because the Reflect object is meant to be a global singleton. More details about this can be found [here](https://github.com/inversify/InversifyJS/issues/262#issuecomment-227593844).

Check out the [Environment support and polyfills](https://github.com/inversify/InversifyJS/blob/master/wiki/environment.md)
page in the wiki and the [Basic example](https://github.com/inversify/inversify-basic-example) to learn more.

## The Basics
Let’s take a look at the basic usage and APIs of InversifyJS with TypeScript:

### Step 1: Declare your interfaces and types

Our goal is to write code that adheres to the [dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle).
This means that we should "depend upon Abstractions and do not depend upon concretions".
Let's start by declaring some interfaces (abstractions).

```ts
// file interfaces.ts

export interface Warrior {
    fight(): string;
    sneak(): string;
}

export interface Weapon {
    hit(): string;
}

export interface ThrowableWeapon {
    throw(): string;
}
```

InversifyJS needs to use the type as identifiers at runtime. We use symbols as identifiers but you can also use classes and or string literals.

PLEASE MAKE SURE TO PLACE THIS TYPES DECLARATION IN A SEPARATE FILE. (see bug #1455)

```ts
// file types.ts

const TYPES = {
    Warrior: Symbol.for("Warrior"),
    Weapon: Symbol.for("Weapon"),
    ThrowableWeapon: Symbol.for("ThrowableWeapon")
};

export { TYPES };

```

> **Note**: It is recommended to use Symbols but InversifyJS also support the usage of Classes and string literals (please refer to the features section to learn more).

### Step 2: Declare dependencies using the `@injectable` & `@inject` decorators
Let's continue by declaring some classes (concretions). The classes are implementations of the interfaces that we just declared. We will annotate them with the `@injectable` decorator.

When a class has a dependency on an interface we also need to use the `@inject` decorator to define an identifier for the interface that will be available at runtime. In this case we will use the Symbols `Symbol.for("Weapon")` and `Symbol.for("ThrowableWeapon")` as runtime identifiers.

```ts
// file entities.ts

import { injectable, inject } from "inversify";
import "reflect-metadata";
import { Weapon, ThrowableWeapon, Warrior } from "./interfaces";
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

    constructor(
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
// file inversify.config.ts

import { Container } from "inversify";
import { TYPES } from "./types";
import { Warrior, Weapon, ThrowableWeapon } from "./interfaces";
import { Ninja, Katana, Shuriken } from "./entities";

const myContainer = new Container();
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
import { TYPES } from "./types";
import { Warrior } from "./interfaces";

const ninja = myContainer.get<Warrior>(TYPES.Warrior);

expect(ninja.fight()).eql("cut!"); // true
expect(ninja.sneak()).eql("hit!"); // true
```

As we can see the `Katana` and `Shuriken` were successfully resolved and injected into `Ninja`.

InversifyJS supports ES5 and ES6 and can work without TypeScript.
Head to the [**JavaScript example**](https://github.com/inversify/InversifyJS/blob/master/wiki/basic_js_example.md) to learn more!

## 🚀 The InversifyJS Features and API
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
- [Auto named factory](https://github.com/inversify/InversifyJS/blob/master/wiki/auto_named_factory.md)
- [Injecting a Provider (asynchronous Factory)](https://github.com/inversify/InversifyJS/blob/master/wiki/provider_injection.md)
- [Activation handler](https://github.com/inversify/InversifyJS/blob/master/wiki/activation_handler.md)
- [Deactivation handler](https://github.com/inversify/InversifyJS/blob/master/wiki/deactivation_handler.md)
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

## 🧩 Ecosystem
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

Copyright © 2015-2017 [Remo H. Jansen](http://www.remojansen.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
