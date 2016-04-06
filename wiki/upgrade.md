# How to upgrade from 1.x to 2.x

Version 2.x introduces some changes in the API.

### Naming changes

The 1.x `TypeBinding` is named `Binding` in 2.x

The 1.x `BindingScopeEnum` is named `BindingScope` in 2.x

### Fluent binding syntax

The 1.x binding syntax looks as follows:
```ts
kernel.bind(new TypeBinding<FooInterface>("FooInterface", Foo, BindingScopeEnum.Transient));
```
The 2.x binding syntax looks as follows:
```ts
kernel.bind<FooInterface>("FooInterface").to(Foo).inTransientScope()
```
### Resolution syntax
The 1.x `kernel.resolve<T>(identifier: string)` method is now `kernel.get<T>(identifier: string)` 2.x.

The 1.x resolution syntax looks as follows:
```ts
var foobar = kernel.resolve<FooBarInterface>("FooBarInterface");
```
The 2.x resolution syntax looks as follows:
```ts
var foobar = kernel.get<FooBarInterface>("FooBarInterface");
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
class Ninja implements INinja {

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
But if your class has a dependency on an interface you will also need to use the `@inject` decorator.
```ts
@injectable()
class Ninja implements INinja {

    private _katana: IKatana;
    private _shuriken: IShuriken;

    public constructor(
        @inject("IKatana") katana: IKatana,
        @inject("IShuriken") shuriken: IShuriken
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
``` 
