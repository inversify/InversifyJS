# Multi-injection

We can use multi-injection When two or more concretions have been bound to the an abstraction.
Notice how an array of `Weapon` is injected into the `Ninja` class via its constructor thanks to the usage of the `@multiInject` decorator:

```ts
interface Weapon {
    name: string;
}

@injectable()
class Katana implements Weapon {
    public name = "Katana";
}

@injectable()
class Shuriken implements Weapon {
    public name = "Shuriken";
}

interface Ninja {
    katana: Weapon;
    shuriken: Weapon;
}

@injectable()
class Ninja implements Ninja {
    public katana: Weapon;
    public shuriken: Weapon;
    public constructor(
	    @multiInject("Weapon") weapons: Weapon[]
    ) {
        this.katana = weapons[0];
        this.shuriken = weapons[1];
    }
}
```

We are binding `Katana` and `Shuriken` to `Weapon`:

```ts
kernel.bind<Ninja>("Ninja").to(Ninja);
kernel.bind<Weapon>("Weapon").to(Katana);
kernel.bind<Weapon>("Weapon").to(Shuriken);
```
