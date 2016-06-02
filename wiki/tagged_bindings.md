# Tagged bindings
We can use tagged bindings to fix `AMBIGUOUS_MATCH` errors when two or more
concretions have been bound to the an abstraction. Notice how the  constructor
arguments of the `Ninja` class have been annotated using the `@tagged` decorator:
```ts
interface IWeapon {}

@injectable()
class Katana implements IWeapon {}

@injectable()
class Shuriken implements IWeapon {}

interface INinja {
    katana: IWeapon;
    shuriken: IWeapon;
}

@injectable()
class Ninja implements INinja {
    public katana: IWeapon;
    public shuriken: IWeapon;
    public constructor(
        @inject("IWeapon") @tagged("canThrow", false) katana: IWeapon,
        @inject("IWeapon") @tagged("canThrow", true) shuriken: IWeapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

We are binding `Katana` and `Shuriken` to `IWeapon` but a `whenTargetTagged`
constraint is added to avoid `AMBIGUOUS_MATCH` errors:

```ts
kernel.bind<INinja>(ninjaId).to(Ninja);
kernel.bind<IWeapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
kernel.bind<IWeapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);
```
