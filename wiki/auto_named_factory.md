# Auto named factory

Binds an abstraction to an auto-generated Factory that return elements by given name.

```ts
@injectable()
class Ninja implements Ninja {
    private _katana: Weapon;
    private _shuriken: Weapon;
    public constructor(
        @inject("Factory<Weapon>") weaponFactory: (named: string) => interfaces.Factory<Weapon>
    ) {
        this._katana = weaponFactory("katana");
        this._shuriken = weaponFactory("shuriken");
    }
}
```

```ts
container.bind<Ninja>("Ninja").to(Ninja);
container.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("katana");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("shuriken");
container.bind<interfaces.Factory<Weapon>>("Factory<Weapon>")
         .toAutoNamedFactory<Weapon>("Weapon");
```
