# 如何从 2.x 升级到 3.x

- 2.x 中的 `Kernel` 在 3.x 中改名叫 `Container`。

- 2.x 中的 `Kernel` 方法 `getServiceIdentifierAsString` 在 3.x 中不再是 `Container` 的方法。

- 2.x 中的 `PlanAndResolveArgs` 接口在 3.0 中改名叫 `NextArgs` 并且其中一些属性有了变化。

- `Provider` 签名有了变化。

- 在 3.x 中, `strictNullChecks` 被启用了。

- 2.0 和 3.0 中的解决逻辑只有很小的差别，这是为了支持像 可选依赖 和 默认上下文注入 这样的新特性。

# 如何从 1.x 升级到 2.x

2.x 版本引入了一些接口变化

### 命名改变

1.x 中的 `TypeBinding` 在 2.x 中改成了 `Binding` 

1.x 中的 `BindingScopeEnum` 在 2.x 中改成了 `BindingScope` 

### 流利的绑定语法

1.x 中的绑定语法看上去是这样的：

```ts
container.bind(new TypeBinding<FooInterface>("FooInterface", Foo, BindingScopeEnum.Transient));
```

2.x 中的绑定语法看上去是这样的：

```ts
container.bind<FooInterface>("FooInterface").to(Foo).inTransientScope()
```

### 解决语法

1.x 中的 `container.resolve<T>(identifier: string)` 方法在 2.x 中是 `container.get<T>(identifier: string)` 

1.x 中的解决语法看上去是这样：

```ts
var foobar = container.resolve<FooBarInterface>("FooBarInterface");
```

2.x 中的解决语法看上去是这样：

```ts
var foobar = container.get<FooBarInterface>("FooBarInterface");
```

### @injectable 和 @inject

所有的类必须被 `@injectable()` 装饰器装饰。如果你的类有一个对类的依赖，这样就够了：

```ts
@injectable()
class Katana {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Shuriken {
    public throw() {
        return "hit!";
    }
}

@injectable()
class Ninja implements Ninja {

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

如果你的类有一个对接口的依赖，你还需要使用 `@inject` 装饰器。

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
