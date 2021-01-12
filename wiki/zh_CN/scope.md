# 控制依赖关系的生命周期

InversifyJS 默认使用短暂的生命周期但是你也可以使用单例和请求生命周期：

```ts
container.bind<Shuriken>("Shuriken").to(Shuriken).inTransientScope(); // Default
container.bind<Shuriken>("Shuriken").to(Shuriken).inSingletonScope();
container.bind<Shuriken>("Shuriken").to(Shuriken).inRequestScope();
```

## 关于 `inSingletonScope`

有许多可用的绑定类型：

```ts
interface BindingToSyntax<T> {
    to(constructor: { new (...args: any[]): T; }): BindingInWhenOnSyntax<T>;
    toSelf(): BindingInWhenOnSyntax<T>;
    toConstantValue(value: T): BindingWhenOnSyntax<T>;
    toDynamicValue(func: (context: Context) => T): BindingWhenOnSyntax<T>;
    toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
    toFactory<T2>(factory: FactoryCreator<T2>): BindingWhenOnSyntax<T>;
    toFunction(func: T): BindingWhenOnSyntax<T>;
    toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
    toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
}
```

从生命周期如何表现我们可以将这些绑定分成两大组：

- 注入 `object` 的绑定
- 注入 `function` 的绑定

### 注入 `object` 的绑定

这个组里包含如下绑定：、

```ts
interface BindingToSyntax<T> {
    to(constructor: { new (...args: any[]): T; }): BindingInWhenOnSyntax<T>;
    toSelf(): BindingInWhenOnSyntax<T>;
    toConstantValue(value: T): BindingWhenOnSyntax<T>;
    toDynamicValue(func: (context: Context) => T): BindingInWhenOnSyntax<T>;
}
```

`inTransientScope` 被默认使用，而且我们能够选择该类型的绑定生命周期，除了 `toConstantValue` 总是使用 `inSingleScope` 以外。

当我们第一次调用 `container.get` 时，如果我们使用的是 `to`、`toSelf` 或者 `toDynamicValue`，InversifyJS 容器会尝试使用构造器或者动态值工厂生成一个对象实例或者值。如果生命周期被设置为 `inSingletonScope`，则这个值会被缓存。第二次使用同样的资源 ID 调用 `container.get` 时，如果 `inSingletonScope` 被选择了，那么 InversifyJS 会尝试从缓存中获取该值。

注意一个类会有一些依赖并且一个动态值可以通过当前上下文访问其他类型。在相应的复合树中选定的父对象的生命周期中，这些依赖可能是也可能不是单例依赖。
Note that a class can have some dependencies and a dynamic value can access other types via the current context. These dependencies may or may not be a singleton independently of the selected scope of their parent object in their respective composition tree,

### 注入 `function` 的依赖

在这一组中包含了如下类型的绑定：

```ts
interface BindingToSyntax<T> {
    toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
    toFactory<T2>(factory: FactoryCreator<T2>): BindingWhenOnSyntax<T>;
    toFunction(func: T): BindingWhenOnSyntax<T>;
    toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
    toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
}
```

我们不能选择这种绑定类型的生命周期，因为要被注入的值（一个工厂函数）总是单例的。但是，工厂内部的实现可能会也可能不会返回一个单例。

比如，下面的绑定会注入一个总是返回单例的工厂。

```ts
container.bind<interfaces.Factory<Katana>>("Factory<Katana>").toAutoFactory<Katana>("Katana");
```

但是，工厂返回的值却可能是也可能不是单例：

```ts
container.bind<Katana>("Katana").to(Katana).inTransientScope();
// 或者
container.bind<Katana>("Katana").to(Katana).inSingletonScope();
```

## 关于 `inRequestScope`

当我们使用 inRequestScope 时我们在使用一个特殊的单例类型。

- `inSingletonScope` 创建一个在整个绑定类型的生命周期中存活的单例。这意味着当我们使用 `container.unbind` 解绑时该 `inSingletonScope` 可以从内存中清除。

- `inRequestScope` 创建一个在 `container.get`、`container.getTagged` 或者 `container.getNamed` 方法被调用时的生命周期中存活的单例。每次调用会解决一个根依赖及其所有子依赖。内部有一个称为“解决计划”的依赖关系图被 InversifyJS 创建。即使在解决计划中出现多次，该 `inRequestScope` 也只会使用一份对象的单例实例。这减少了解决的次数因此可以作为某些场景下性能优化的手段。

注意，'Request scope' 并不是绑定到 'http request' 的，而是指对 `container` 的一次请求，即一次 `container.get` 或者 `container.resolve` 的调用。

假设你有如下的依赖关系：

```
A -> B -> R
-> C -> R
```

即 A 依赖 B 和 C，而 B 与 C 都依赖 R。

当只使用默认的短暂的生命周期时，如果你从容器里获取 A，那么 B 和 C 将都收到一个不同的 R 的实例。

如果将 R 绑定到了请求的生命周期，那么 B 和 C 将都收到指向同一个实例的引用，即 a.b.r === a.c.r。

如果你再一次地从容器中解决 A，那么这将会创建 R 的一个新的实例，就像它将创建 A、B 和 C 的新实例一样。