# whenTargetIsDefault
When multiple bindings are avaialble for a given service identifier, we can use 
one of the following features to resolve the potential `AMBIGUOUS_MATCH` exception:

- [Named bindings](https://github.com/inversify/InversifyJS/blob/master/wiki/named_bindings.md)
- [Tagged bindings](https://github.com/inversify/InversifyJS/blob/master/wiki/tagged_bindings.md)
- [Contextual bindings](https://github.com/inversify/InversifyJS/blob/master/wiki/contextual_bindings.md)
- Default targets

In this section we will explain how to use default targets.

We can resolve an `AMBIGUOUS_MATCH` exception using a named constraint:

```ts
kernel.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("strong");
kernel.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("weak");
```

Or a tagged constraint:

```ts
kernel.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("strong", true);
kernel.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("strong", false);
```

The problem with this solution is that we will have to annotate using
the `@named("strong")`/`@named("weak")` or `@tagged("strong", true)`/`@tagged("strong", false)`
every single injection.

A betetr solution is to use a default target:

```ts
kernel.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
kernel.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();
```

We can use the `whenTargetIsDefault` to indicate which binding shoul be used as default
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
    public constructor() {
        this.name = "Katana";
    }
}

@injectable()
class Shuriken implements Weapon {
    public name: string;
    public constructor() {
        this.name = "Shuriken";
    }
}

let kernel = new Kernel();
kernel.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
kernel.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();

let defaultWeapon = kernel.get<Weapon>(TYPES.Weapon);
let throwableWeapon = kernel.getNamed<Weapon>(TYPES.Weapon, TAG.throwable);

expect(defaultWeapon.name).eql("Katana");
expect(throwableWeapon.name).eql("Shuriken");
```