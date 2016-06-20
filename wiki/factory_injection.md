# Injecting a Factory
Binds an abstraction to a user defined Factory.

```ts
@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
	    @inject("Factory<Katana>") katanaFactory: () => Katana, 
	    @inject("Shuriken") shuriken: Shuriken
    ) {
        this._katana = katanaFactory();
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

```ts
kernel.bind<interfaces.Factory<Katana>>("Factory<Katana>").toFactory<Katana>((context: interfaces.Context) => {
    return () => {
        return context.kernel.get<Katana>("Katana");
    };
});
```

You can also define a Factory with args:

```ts
kernel.bind<interfaces.Factory<Weapon>>("Factory<Weapon>").toFactory<Weapon>((context: interfaces.Context) => {
    return (throwable: boolean) => {
        if (throwable) {
            return context.kernel.getTagged<Weapon>("Weapon", "throwable", true);
        } else {
            return context.kernel.getTagged<Weapon>("Weapon", "throwable", false);
        }
    };
});
```

Sometimes you might need to pass arguments to a factory in different moments during the execution:

```ts
kernel.bind<Engine>("Engine").to(PetrolEngine).whenTargetNamed("petrol");
kernel.bind<Engine>("Engine").to(DieselEngine).whenTargetNamed("diesel");

kernel.bind<interfaces.Factory<Engine>>("Factory<Engine>").toFactory<Engine>((context) => {
    return (named: string) => (displacement: number) => {
        let engine = context.kernel.getNamed<Engine>("Engine", named);
        engine.displacement = displacement;
        return engine;
    };
});

@injectable()
class DieselCarFactory implements CarFactory {
    private _dieselFactory: (displacement: number) => Engine ;
    constructor(
        @inject("Factory<Engine>") factory: (category: string) => (displacement: number) => Engine
    ) {
        this._dieselFactory = factory("diesel");
    }
    public createEngine(displacement: number): Engine {
        return this._dieselFactory(displacement);
    }
}
```
