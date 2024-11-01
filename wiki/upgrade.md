# How to upgrade from 4.x to 5.x
- the 4.x `guid(): string` method has been replaced by `id(): number`
- the property `guid: string` has been replaced by `id: number` in the following [interfaces](https://github.com/inversify/InversifyJS/blob/master/src/interfaces/interfaces.ts) and their implementations
    thub.com/inversify/InversifyJS/blob/master/src/contain* [Binding](https://github.com/inversify/InversifyJS/blob/master/src/bindings/binding.ts)
    * [Context](https://github.com/inversify/InversifyJS/blob/master/src/planning/context.ts)
    * [Request](https://github.com/inversify/InversifyJS/blob/master/src/planning/request.ts)
    * [Target](https://github.com/inversify/InversifyJS/blob/master/src/planning/target.ts)
    * [Container](https://github.com/inversify/InversifyJS/blob/master/src/container/container.ts)
    * [ContainerModule](https://github.com/inversify/InversifyJS/blob/master/src/container/container_module.ts)
    * [AsyncContainerModule](https://gier/container_module.ts)

# How to upgrade from 2.x to 3.x

- The 2.x `Kernel` is named `Container` in 3.x

- The 2.x `Kernel` method `getServiceIdentifierAsString` is not a method of `Container`  in 3.x.

- The 2.x `PlanAndResolveArgs` interface is named `NextArgs` in 3.0 and some of its properties have changed.

- The `Provider` signature has been modified.

- In 3.x, `strictNullChecks` is enabled.

- The resolution logic in 2.0 and 3.0 is slightly different in order to support new features like 
optional dependencies and defaults contextual injections.

# How to upgrade from 1.x to 2.x

Version 2.x introduces some changes in the API.

### Naming changes

The 1.x `TypeBinding` is named `Binding` in 2.x

The 1.x `BindingScopeEnum` is named `BindingScope` in 2.x

### Fluent binding syntax

The 1.x binding syntax looks as follows:

```ts
container.bind(new TypeBinding<FooInterface>("FooInterface", Foo, BindingScopeEnum.Transient));
```

The 2.x binding syntax looks as follows:

```ts
container.bind<FooInterface>("FooInterface").to(Foo).inTransientScope()
```

### Resolution syntax

The 1.x `container.resolve<T>(identifier: string)` method is now `container.get<T>(identifier: string)` 2.x.

The 1.x resolution syntax looks as follows:

```ts
var foobar = container.resolve<FooBarInterface>("FooBarInterface");
```

The 2.x resolution syntax looks as follows:

```ts
var foobar = container.get<FooBarInterface>("FooBarInterface");
```

### @injectable & @inject
All your classes must be decorated with the `@injectable()` decorator. If your class has a dependency in a class that's enough:

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

    constructor(
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
But if your class has a dependency on an interface you will also need to use the `@inject` decorator.

```ts
@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    constructor(
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
