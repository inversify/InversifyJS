# Multi-injection

We can use multi-injection when two or more concretions have been bound to an abstraction.
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
container.bind<Ninja>("Ninja").to(Ninja);
container.bind<Weapon>("Weapon").to(Katana);
container.bind<Weapon>("Weapon").to(Shuriken);
```

## About the spread `...` operator

In early releases of InversifyJS the spread operator used to fail without throwing any errors.
That was not acceptable and we implemented a fix that allows you to inject arrays using the
spread operator. However it is not recommended because it turns out to be a bit useless.

You can inject using `@multiInject` and `...` as follows:

```ts
@injectable()
class Foo {
    public bar: Bar[];
    constructor(@multiInject(BAR) ...args: Bar[][]) {
        // args will always contain one unique item the value of that item is a Bar[] 
        this.bar = args[0];
    }
}
```

The main problem is that this requires the type of `args` to be `Bar[][]`
because multiInject will wrap the injections using an array and the spread
operator will do the same. As a result the injection is wrapped by an array
two times.

We tried to solve this problem but the only way was to generate some additional
metadata using a `@spread()` decorator.

```ts
@injectable()
class Foo {
    public bar: Bar[];
    constructor(@multiInject(BAR) @spread() ...args: Bar[]) {
        this.bar = args[0];
    }
}
```

We discarded this idea because it is better to use decorators when there is no
other way to achieve something. In this case there is a much simpler way to
achieve the desired result. We just need to **use `@multiInject` and avoid using `...`**:

```ts
@injectable()
class Foo {
    public bar: Bar[];
    constructor(@multiInject(BAR) args: Bar[]) {
        this.bar = args;
    }
}
```
