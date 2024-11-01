# whenTargetIsDefault
When multiple bindings are available for a given service identifier, we can use 
one of the following features to resolve the potential `AMBIGUOUS_MATCH` exception:

- [Named bindings](https://github.com/inversify/InversifyJS/blob/master/wiki/named_bindings.md)
- [Tagged bindings](https://github.com/inversify/InversifyJS/blob/master/wiki/tagged_bindings.md)
- [Contextual bindings](https://github.com/inversify/InversifyJS/blob/master/wiki/contextual_bindings.md)
- Default targets

In this section we will explain how to use default targets.

We can resolve an `AMBIGUOUS_MATCH` exception using a named constraint:

```ts
container.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("strong");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("weak");
```

Or a tagged constraint:

```ts
container.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("strong", true);
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("strong", false);
```

The problem with this solution is that we will have to annotate using
the `@named("strong")`/`@named("weak")` or `@tagged("strong", true)`/`@tagged("strong", false)`
every single injection.

A better solution is to use a default target:

```ts
container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();
```

We can use the `whenTargetIsDefault` to indicate which binding should be used as default
to resolve an `AMBIGUOUS_MATCH` exception when no `@named` or `@tagged` annotations 
are available.

```ts
let TYPES = {
    Weapon: "Weapon"
};

let TAG = {
    throwable: "throwable"
};

interface Weapon {
    name: string;
}

@injectable()
class Katana implements Weapon {
    public name: string;
    constructor() {
        this.name = "Katana";
    }
}

@injectable()
class Shuriken implements Weapon {
    public name: string;
    constructor() {
        this.name = "Shuriken";
    }
}

let container = new Container();
container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();

let defaultWeapon = container.get<Weapon>(TYPES.Weapon);
let throwableWeapon = container.getNamed<Weapon>(TYPES.Weapon, TAG.throwable);

expect(defaultWeapon.name).eql("Katana");
expect(throwableWeapon.name).eql("Shuriken");
```