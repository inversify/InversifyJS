#### Injecting a Factory
Binds an abstraction to a user defined Factory.

```ts
@injectable()
class Ninja implements INinja {

    private _katana: IKatana;
    private _shuriken: IShuriken;

    public constructor(
	    @inject("IFactory<IKatana>") katanaFactory: () => IKatana, 
	    @inject("IShuriken") shuriken: IShuriken
    ) {
        this._katana = katanaFactory();
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

```ts
kernel.bind<IFactory<IKatana>>("IFactory<IKatana>").toFactory<IKatana>((context) => {
    return () => {
        return context.kernel.get<IKatana>("IKatana");
    };
});
```

You can also define a Factory with args:

```ts
kernel.bind<IFactory<IWeapon>>("IFactory<IWeapon>").toFactory<IWeapon>((context) => {
    return (throwable: boolean) => {
        if (throwable) {
            return context.kernel.getTagged<IWeapon>("IWeapon", "throwable", true);
        } else {
            return context.kernel.getTagged<IWeapon>("IWeapon", "throwable", false);
        }
    };
});
```

Sometimes you might need to pass arguments to a factory in different moments during the execution:
```ts
kernel.bind<IEngine>("IEngine").to(PetrolEngine).whenTargetNamed("petrol");
kernel.bind<IEngine>("IEngine").to(DieselEngine).whenTargetNamed("diesel");

kernel.bind<IFactory<IEngine>>("IFactory<IEngine>").toFactory<IEngine>((context) => {
    return (named: string) => (displacement: number) => {
        let engine = context.kernel.getNamed<IEngine>("IEngine", named);
        engine.displacement = displacement;
        return engine;
    };
});

@injectable()
class DieselCarFactory implements ICarFactory {
    private _dieselFactory: (displacement: number) => IEngine ;
    constructor(
        @inject("IFactory<IEngine>") factory: (category: string) => (displacement: number) => IEngine
    ) {
        this._dieselFactory = factory("diesel");
    }
    public createEngine(displacement: number): IEngine {
        return this._dieselFactory(displacement);
    }
}
```
