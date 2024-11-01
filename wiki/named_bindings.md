# Named bindings
We can use named bindings to fix `AMBIGUOUS_MATCH` errors when two or more concretions have
been bound to the an abstraction. Notice how the constructor arguments of the `Ninja` class
have been annotated using the `@named` decorator:

```ts
interface Weapon {}

@injectable()
class Katana implements Weapon {}

@injectable()
class Shuriken implements Weapon {}

interface Ninja {
    katana: Weapon;
    shuriken: Weapon;
}

@injectable()
class Ninja implements Ninja {
    public katana: Weapon;
    public shuriken: Weapon;
    constructor(
        @inject("Weapon") @named("strong") katana: Weapon,
        @inject("Weapon") @named("weak") shuriken: Weapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

We are binding `Katana` and `Shuriken` to `Weapon` but a `whenTargetNamed` constraint is
added to avoid `AMBIGUOUS_MATCH` errors:

```ts
container.bind<Ninja>("Ninja").to(Ninja);
container.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("strong");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("weak");
```
