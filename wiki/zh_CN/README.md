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

一个强大又轻量的控制反转容器，提供给JavaScript 和 Node.js 应用使用，使用TypeScript编写。


## 简介
InversifyJS 是一个轻量的 (4KB) 控制反转容器 (IoC)，可用于编写 TypeScript 和 JavaScript 应用。
它使用类构造函数去定义和注入它的依赖。InversifyJS API 很友好易懂, 鼓励对 OOP 和 IoC 最佳实践的应用.

## 为什么要有 InversifyJS?
JavaScript 现在支持面向对象编程，基于类的继承。 这些特性不错但事实上它们也是
[危险的](https://medium.com/@dan_abramov/how-to-use-classes-and-sleep-at-night-9af8de78ccb4)。
我们需要一个优秀的面向对象设计(比如 [SOLID](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)), [Composite Reuse](https://en.wikipedia.org/wiki/Composition_over_inheritance)等) 来保护我们避免这些威胁。
然而，面向对象的设计是复杂的，所以我们创建了 InversifyJS。

InversifyJS 是一个工具，它能帮助 JavaScript 开发者，写出出色的面向对象设计的代码。

## InversifyJS 的原理
InversifyJS有4个主要目标:

1. 允许JavaScript开发人员编写遵循 SOLID 原则的代码。

2. 促进并鼓励遵守最佳的面向对象编程和依赖注入实践。

3. 尽可能少的运行时开销。

4. 提供[艺术编程体验和生态](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md).

## 业内评价

**[Nate Kohari](https://twitter.com/nkohari)** - [Ninject](https://github.com/ninject/Ninject)的作者

> *"非常漂亮！我已经尝试了不少用于创建JavaScript/TypeScript依赖注入的框架，但是由于缺少运行期类型信息(RTTI)，实现时有很大阻碍。* 

> *ES7的元数据已经帮助我们向前进了一大步（正如你所看到）。继续加油保持！*

**[Michel Weststrate](https://twitter.com/mweststrate)** - [MobX](https://github.com/mobxjs/mobx)的作者
> *像InversifyJS这样的依赖注入框架非常强大*

## 使用 InversifyJS 的一些公司

[<img src="https://avatars0.githubusercontent.com/u/6154722?s=200&v=4" width="100" />](https://opensource.microsoft.com/) [<img src="https://pbs.twimg.com/profile_images/827249559046909954/SyaBPcH8_400x400.jpg" width="100" />](http://acia.aon.com/index.php/home/) [<img src="https://avatars3.githubusercontent.com/u/114767?s=200&v=4" width="100" />](https://www.lonelyplanet.com/) [<img src="https://avatars0.githubusercontent.com/u/25283328?s=200&v=4" width="100" />](https://jincor.com/) [<img src="https://avatars1.githubusercontent.com/u/1957282?s=200&v=4" width="100" />](https://www.web-computing.de/) [<img src="https://avatars1.githubusercontent.com/u/17648048?s=200&v=4" width="100" />](https://dcos.io/) [<img src="https://avatars0.githubusercontent.com/u/16970371?s=200&v=4" width="100" />](https://typefox.io/) [<img src="https://avatars0.githubusercontent.com/u/18010308?s=200&v=4" width="100" />](https://code4.ro/) [<img src="https://user-images.githubusercontent.com/10656223/33888109-fae0852e-df43-11e7-97f6-9db543da0bde.png" width="100">](http://www.baidu.com/) [<img src="https://avatars2.githubusercontent.com/u/8085382?s=200&v=4" width="100" />](https://www.imdada.cn/) [<img src="https://avatars2.githubusercontent.com/u/17041151?s=200&v=4" width="100" />](https://www.ato.gov.au/) [<img src="https://avatars1.githubusercontent.com/u/14963540?s=200&v=4" width="100" />](https://www.kaneoh.com/) [<img src="https://avatars0.githubusercontent.com/u/26021686?s=200&v=4" width="100" />](https://particl.io/) [<img src="https://avatars2.githubusercontent.com/u/24523195?s=200&v=4" width="100" />](https://slackmap.com/) [<img src="https://avatars3.githubusercontent.com/u/16556899?s=200&v=4" width="100" />](https://www.go1.com/) [<img src="https://avatars3.githubusercontent.com/u/23475730?s=200&v=4" width="100" />](http://www.stellwagengroup.com/stellwagen-technology/) [<img src="https://avatars1.githubusercontent.com/u/15262567?s=200&v=4" width="100" />](https://www.edrlab.org/) [<img src="https://avatars1.githubusercontent.com/u/10072104?s=200&v=4" width="100" />](https://www.goodgamestudios.com/) [<img src="https://avatars2.githubusercontent.com/u/13613760?s=200&v=4" width="100" />](https://freshfox.at/) [<img src="https://avatars1.githubusercontent.com/u/864482?s=200&v=4" width="100" />](https://schubergphilis.com/)

## 安装

您可以使用npm获得最新的版本和类型定义: 

```
$ npm install inversify reflect-metadata --save
```

Inversify npm 包已经包含了 InversifyJS 的类型定义

> :警示: **重要!** InversifyJS 需要 TypeScript 的版本 >= 2.0 还有 `experimentalDecorators`, `emitDecoratorMetadata`, `types` and `lib` 在 `tsconfig.json` 中 compilerOptions 的配置如下:

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

inversifyjs需要现代JavaScript引擎，支持以下特性

- [Reflect metadata](https://rbuckton.github.io/reflect-metadata/)
- [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) (Only required if using [provider injection](https://github.com/inversify/InversifyJS/blob/master/wiki/provider_injection.md))
- [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) (Only required if using [activation handlers](https://github.com/inversify/InversifyJS/blob/master/wiki/activation_handler.md))

If your environment doesn't support one of these you will need to import a shim or polyfill.
如果您的运行环境不支持这些特性，您可能需要导入 `shim` 或 `polyfill`

> :警示: **`reflect-metadata` polyfill 应该在您整个应用中只导入一次** 因为 `Reflect` 对象需要成为一个全局的单例。 关于这的更多细节可以在[这里](https://github.com/inversify/InversifyJS/issues/262#issuecomment-227593844)找到。 

查看 维基中的[开发环境 `polyfills`](https://github.com/inversify/InversifyJS/blob/master/wiki/environment.md)
, 还可以从[基本示例](https://github.com/inversify/inversify-basic-example)中去学习.

## 基础部分
Let’s take a look at the basic usage and APIs of InversifyJS with TypeScript:
让我们一起看下 inversifyjs 的基本用法和 API：

### 步骤 1: 声明接口和类型

我们的目标是编写遵循[依赖倒置原则](https://en.wikipedia.org/wiki/Dependency_inversion_principle)的代码。

这意味着我们应该 ”依赖于抽象而不依赖于具体实现“ 。

让我们先声明一些接口（抽象）。

```ts
// file interfaces.ts

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

Inversifyjs 需要在运行时使用类型标记作为标识符。接下来将使用 `Symbol` 作为标识符，您也可以使用类或字符串。
 
```ts
// file types.ts

const TYPES = {
    Warrior: Symbol.for("Warrior"),
    Weapon: Symbol.for("Weapon"),
    ThrowableWeapon: Symbol.for("ThrowableWeapon")
};

export { TYPES };

```

> **警示**: 推荐使用 `Symbol`， 但 InversifyJS 也支持使用类和字符串字面值 (请查阅特性部分了解更多)。

### 步骤 2: 使用 `@injectable` 和 `@inject` 装饰器声明依赖
让我们来声明一些类，实现刚刚声明接口。他们都需要使用 `@injectable` 装饰器去注解。

当一个类依赖于某个接口时，我们也需要使用 `@inject` 装饰器，来定义在运行时可用的接口标识。在这种情况下，我们将使用 `Symbol`, 如 `Symbol.for("Weapon")` 和 `Symbol.for("ThrowableWeapon")` 作为运行时的标识。
```ts
// file entities.ts

import { injectable, inject } from "inversify";
import "reflect-metadata";
import { Weapon, ThrowableWeapon, Warrior } from "./interfaces"
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

如果您更喜欢使用属性注入而不是构造函数注入，那就可以不用声明类的构造函数了：

```ts
@injectable()
class Ninja implements Warrior {
    @inject(TYPES.Weapon) private _katana: Weapon;
    @inject(TYPES.ThrowableWeapon) private _shuriken: ThrowableWeapon;
    public fight() { return this._katana.hit(); }
    public sneak() { return this._shuriken.throw(); }
}
```

### 步骤 3: 创建和配置容器
推荐在命名为 `inversify.config.ts` 的文件中创建和配置容器。这是唯一有耦合的地方。
在您项目其余部分中的类，不应该包含对其他类的引用。

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

### 步骤 4: 解析依赖

您可以使用方法 `get<T>` 从 `Container` 中获得依赖。
记得您应该在[根结构](http://blog.ploeh.dk/2011/07/28/CompositionRoot/)(尽可能靠近应用程序的入口点的位置)去解析依赖，避免[服务器定位反模式](http://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/)。
```ts
import { myContainer } from "./inversify.config";
import { TYPES } from "./types";
import { Warrior } from "./interfaces";

const ninja = myContainer.get<Warrior>(TYPES.Warrior);

expect(ninja.fight()).eql("cut!"); // true
expect(ninja.sneak()).eql("hit!"); // true
```

正如我们所看到的 `Katana` and `Shuriken` 被成功的解析和注入进 `Ninja`.

InversifyJS 支持 ES5 和 ES6 而且可以在没有 TypeScript 环境下使用.
前往 [**JavaScript 示例**](https://github.com/inversify/InversifyJS/blob/master/wiki/basic_js_example.md) 去了解更多

## InversifyJS 特性 和 API
让我们一起看看 InversifyJS 的特性!

- [类作为标识](https://github.com/inversify/InversifyJS/blob/master/wiki/classes_as_id.md)
- [Symbol作为标识](https://github.com/inversify/InversifyJS/blob/master/wiki/symbols_as_id.md)
- [容器 API](https://github.com/inversify/InversifyJS/blob/master/wiki/container_api.md)
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
- [属性注入](https://github.com/inversify/InversifyJS/blob/master/wiki/property_injection.md)
- [循环依赖](https://github.com/inversify/InversifyJS/blob/master/wiki/circular_dependencies.md)
- [Inheritance](https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md)

请查阅 [wiki](https://github.com/inversify/InversifyJS/blob/master/wiki/readme.md) 获取更多细节.

## 生态
为了提供艺术般的开发体验，我们也不断努力:

- [中间件插件](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md#extensions).
- [开发工具](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md#development-tools).
- [例子](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md#examples).

请查阅 [生态 wiki 页](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md) 去了解更多.

## Support
如果您遇到任何问题，我们乐意帮忙。您可以使用 [问题页](https://github.com/inversify/InversifyJS/issues) 报告问题。

如果您想要和开发团队分享您的想法或者加入我们，您可以参加 [论坛讨论](https://groups.google.com/forum/#!forum/inversifyjs)。您也可以查看 [wiki](https://github.com/inversify/InversifyJS/blob/master/wiki/readme.md) 来了解更多关于 InversifyJS。

## Acknowledgements

Thanks a lot to all the [contributors](https://github.com/inversify/InversifyJS/graphs/contributors), all the developers out there using InversifyJS and all those that help us to spread the word by sharing content about InversifyJS online. Without your feedback and support this project would not be possible.

## License

License under the MIT License (MIT)

Copyright © 2015-2017 [Remo H. Jansen](http://www.remojansen.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 

IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
