# 为什么有 InversifyJS

有很多好的原因，但是我们想强调其中这些：

## 1. 真正解耦

InversifyJS 赋予你真正解耦的能力。考虑如下的类：

```ts
let TYPES = {
  Ninja: Symbol.for("Ninja"),
  Katana: Symbol.for("Katana"),
  Shuriken: Symbol.for("Shuriken")
};

export { TYPES };
```

```ts
import { TYPES } from "./constants/types";

@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
        @inject(TYPES.Katana) katana: Katana,
        @inject(TYPES.Shuriken) shuriken: Shuriken
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

`Ninja` 类永远不会指向 `Katana` 或者 `Shuriken` 类。但是，它会指向接口（在设计时）或者符号（在运行时），由于这是抽象的所以这是可接受的。毕竟[**依赖抽象**](https://en.wikipedia.org/wiki/Dependency_inversion_principle)正是依赖反转所要做的。

InversifyJS 容器是应用中唯一清楚生命周期和依赖关系的元素。我们推荐在一个保存在包含应用源代码的根文件夹下名为 `inversify.config.ts` 的文件中按照如下方式来写：

```ts
import { TYPES } from "./constants/types";
import { Katana } from "./entitites/katana";
import { Shuriken } from "./entitites/shuriken";
import { Ninja } from "./entitites/ninja";

container.bind<Katana>(TYPES.KATANA).to(Katana);
container.bind<Shuriken>(TYPES.SHURIKEN).to(Shuriken);
container.bind<Ninja>(TYPES.NINJA).to(Ninja);
```

这意味着应用中所有的耦合关系发生在唯一一处：`inversify.config.ts` 文件中。
这非常重要，并且我们会用一个实例来证明其重要性。
让我们想象我们正在更改一个游戏的难度级别。
我们只需要去 `inversify.config.ts` 文件中并且修改 Katana 的绑定即可：

```ts
import { Katana } from "./entitites/SharpKatana";

if(difficulty === "hard") {
    container.bind<Katana>(TYPES.KATANA).to(SharpKatana);
} else {
    container.bind<Katana>(TYPES.KATANA).to(Katana);
}
```

你根本不需要修改 Ninja 文件！

需要付出的代价是符号或者字符串字面量的使用，但是只要你在一个文件中定义所有的字符串字面量，那么这个代价将有所缓和
([Redux 中的 actions](https://github.com/reactjs/redux/blob/master/examples/todomvc/src/constants/ActionTypes.js) 就是这么做的)。
好消息是未来这些符号或者字符串字面量
[能够由 TS 编译器自动生成](https://github.com/Microsoft/TypeScript/issues/2577)，但是目前这还在 TC39 委员会的手中。

## 2. 消除竞争问题

一些“老”的 JavaScript IOC 容器比如 angular 1.x 中的 `$injector` 会有些问题：

![](https://i.imgur.com/Y2lRw4N.png)

[来源](https://angular.io/docs/ts/latest/guide/dependency-injection.html)

InversifyJS 消除了这些问题：

- 为短暂和单例生命周期提供支持。
- 由于标签、命名和上下文绑定，没有命名空间冲突。
- 这是一个独立库。

## 3. 拥有你能需要的所有特性

据我所知这是 JavaScript 中唯一拥有复杂依赖关系解决功能、多生命周期（短暂的、单例）以及很多其他功能的 IoC 容器（比如上下文绑定）。
在这之上还有增加特性的空间，比如拦截器或者 web worker 生命周期。
我们还有计划开发开发者工具，比如浏览器扩展以及中间件（日志、缓存……）。

## 4. 对象组合是一个痛点

你也许认为你不需要 IoC 容器。

![](https://raw.githubusercontent.com/inversify/inversify.github.io/master/img/so.png)

如果[之前的争论](http://stackoverflow.com/questions/871405/why-do-i-need-an-ioc-container-as-opposed-to-straightforward-di-code) 还不够，那么你可能需要读一读下面的文章：

- [目前 JavaScript 中的依赖反转状态](http://blog.wolksoftware.com/the-current-state-of-dependency-inversion-in-javascript)
- [关于 TypeScript / ES6 中的面向对象设计和“类”以及“继承”关键字](https://blog.wolksoftware.com/about-classes-inheritance-and-object-oriented-design-in-typescript-and-es6)

## 5. 类型安全

该库使用 TypeScript 开发所以如果你使用 TypeScript 那么天然类型安全，不过值得一提的是如果你尝试将 Katana 注入到一个期待 `Shuriken` 实现的类中，你会得到一个编译错误。

## 6. 棒极了的开发体验

我们非常努力地为你的 JavaScript 应用提供一个棒极了的 IoC 容器，同时也为你提供一个棒极了的开发体验。
我们话费了很多时间尝试让 InversifyJS 尽可能对用户友好，以及正在开发相关 Chrome 工具，而且已经开发了日志中间件来帮你在 Node.js 中调试。

![](https://inversify.io/img/devtools1.png)
