# Support for classes
InversifyJS allows your classes to have a direct dependency on other classes. When doing so you will need to use the `@injectable` decorator but you will not be required to use the `@inject` decorator. 

The `@inject` decorator is not required when you use classes. The annotation is not required because the typescript compiler generates the metadata for us. However, this won't hapen if you forget one of the following things:

- Import `reflect-metadata`
- Set `emitDecoratorMetadata` to `true` in `tsconfig.json`.

```ts
import { Container, injectable, inject } from "inversify";

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

    public constructor(katana: Katana, shuriken: Shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}

var container = new Container();
container.bind<Ninja>(Ninja).to(Ninja);
container.bind<Katana>(Katana).to(Katana);
container.bind<Shuriken>(Shuriken).to(Shuriken);
```

# Self-binding of concrete types
If the type you’re resolving is a concrete type the registration of a binding can feel a repetitive and verbose:

```ts
container.bind<Samurai>(Samurai).to(Samurai);
```

A better solution is to use the `toSelf` method:

```ts
container.bind<Samurai>(Samurai).toSelf();
```
