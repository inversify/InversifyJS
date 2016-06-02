# Named bindings
We can use named bindings to fix `AMBIGUOUS_MATCH` errors when two or more concretions have
been bound to the an abstraction. Notice how the constructor arguments of the `Ninja` class
have been annotated using the `@named` decorator:
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
        @inject("IWeapon") @named("strong")katana: IWeapon,
        @inject("IWeapon") @named("weak") shuriken: IWeapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

We are binding `Katana` and `Shuriken` to `IWeapon` but a `whenTargetNamed` constraint is
added to avoid `AMBIGUOUS_MATCH` errors:

```ts
kernel.bind<INinja>("INinja").to(Ninja);
kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetNamed("strong");
kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetNamed("weak");
```
