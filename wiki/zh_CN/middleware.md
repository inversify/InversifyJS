# 中间件

InversifyJS 在解决依赖前执行 3 个强制操作：

- 标记
- 计划
- 解决

某些情况下会有额外操作：

- 激活
- 中间件

如果我们配置了中间件，那么它会在解决阶段之前、计划阶段之后某个点执行。中间件可被用来实现强大的开发工具。这些工具可以帮助开发者在开发过程中定位问题。

## 基础中间件

```ts
import { interfaces, Container } from "inversify";

function logger(planAndResolve: interfaces.PlanAndResolve<any>): interfaces.PlanAndResolve<any> {
    return (args: interfaces.PlanAndResolveArgs) => {
        let start = new Date().getTime();
        let result = planAndResolve(args);
        let end = new Date().getTime();
        console.log(end - start);
        return result;
    };
}

let container = new Container();
container.applyMiddleware(logger);
```

现在我们声明了中间件，我们可以创建一个新的容器并且使用它的 applyMiddleware 方法来应用它：

```ts
interface Ninja {}

@injectable()
class Ninja implements Ninja {}

let container = new Container();
container.bind<Ninja>("Ninja").to(Ninja);

container.applyMiddleware(logger);
```

日志中间件会在控制台中记录执行时间：

```ts
let ninja = container.get<Ninja>("Ninja");

> 21
```

## 多个中间件函数

当多个中间件函数被应用时：

```ts
container.applyMiddleware(middleware1, middleware2);
```

这些中间件会被从右往左被调用。这意味着 `middleware2` 在 `middleware1` 之前被调用。

## 上下文截获器

某些情况下你也许想拦截解决计划。

默认的 `contextInterceptor` 被作为一个属性 `args` 传递给中间件。

```ts
function middleware1(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
    return (args: PlanAndResolveArgs) => {
        // args.nextContextInterceptor
        // ...
    };
}
```

你可以使用函数扩展默认的 `contextInterceptor`：

```ts
function middleware1(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
    return (args: PlanAndResolveArgs) => {
        let nextContextInterceptor = args.contextInterceptor;
        args.contextInterceptor = (context: interfaces.Context) => {
            console.log(context);
            return nextContextInterceptor(context);
        };
        return planAndResolve(args);
    };
}
```

## 自定义的元数据读取器

> :警告: 请注意，创建自定义元数据读取器并不被推荐。 我们包含该特性从而允许库/框架创建者们做高度定制，但是一般用户不应该使用自定义元数据读取器。
> 一般来说，自定义元数据读取器仅在当开发框架去给用户提供标记接口时被使用，这些接口比默认标记接口更不明显。
> 
> 如果你在开发框架或者库，并且你创建了自定义元数据读取器，请记得为你的框架提供备选方案来支持默认接口中的装饰器：`@injectable, ``@inject`, `@multiInject`, `@tagged`,
> `@named`, `@optional`, `@targetName` 以及 `@unmanaged`。

中间件允许你截获一个计划并且解决它，但是你不允许改变标记阶段的行为方式。

还有第二个扩展点，允许你决定使用什么样的标记系统类型。默认标记系统利用了装饰器和反射元数据。


```ts
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

你可以使用自定义的元数据读取器来实现定制的标记系统。

比如，你可以基于静态属性实现标记类型：

```ts
class Ninja implements Ninja {

    public static constructorInjections = [
        "Katana", "Shuriken"
    ];

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
        katana: Katana,
        shuriken: Shuriken
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

自定义元数据读取器必须实现 `interfaces.MetadataReader` 接口。

完整的示例 [可从单元测试里找到](https://github.com/inversify/InversifyJS/blob/master/test/features/metadata_reader.test.ts)。

一旦你有了自定义的元数据读取器你就可以应用它了：

```ts
let container = new Container();
container.applyCustomMetadataReader(new StaticPropsMetadataReader());
```
