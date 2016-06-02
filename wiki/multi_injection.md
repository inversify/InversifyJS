#### Multi-injection
We can use multi-injection When two or more concretions have been bound to the an abstraction.
Notice how an array of `IWeapon` is injected into the `Ninja` class via its constructor thanks to the usage of the `@multiInject` decorator:
```ts
interface IWeapon {
    name: string;
}

@injectable()
class Katana implements IWeapon {
    public name = "Katana";
}

@injectable()
class Shuriken implements IWeapon {
    public name = "Shuriken";
}

interface INinja {
    katana: IWeapon;
    shuriken: IWeapon;
}

@injectable()
class Ninja implements INinja {
    public katana: IWeapon;
    public shuriken: IWeapon;
    public constructor(
	    @multiInject("IWeapon") weapons: IWeapon[]
    ) {
        this.katana = weapons[0];
        this.shuriken = weapons[1];
    }
}
```

We are binding `Katana` and `Shuriken` to `IWeapon`:

```ts
kernel.bind<INinja>("INinja").to(Ninja);
kernel.bind<IWeapon>("IWeapon").to(Katana);
kernel.bind<IWeapon>("IWeapon").to(Shuriken);
```
