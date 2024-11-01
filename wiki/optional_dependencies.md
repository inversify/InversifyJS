# Optional dependencies

We can declare an optional dependency using the `@optional()` decorator:

```ts
@injectable()
class Katana {
    public name: string;
    constructor() {
        this.name = "Katana";
    }
}

@injectable()
class Shuriken {
    public name: string;
    constructor() {
        this.name = "Shuriken";
    }
}

@injectable()
class Ninja {
    public name: string;
    public katana: Katana;
    public shuriken: Shuriken;
    constructor(
        @inject("Katana") katana: Katana,
        @inject("Shuriken") @optional() shuriken: Shuriken // Optional!
    ) {
        this.name = "Ninja";
        this.katana = katana;
        this.shuriken = shuriken;
    }
}

let container = new Container();

container.bind<Katana>("Katana").to(Katana);
container.bind<Ninja>("Ninja").to(Ninja);

let ninja = container.get<Ninja>("Ninja");
expect(ninja.name).to.eql("Ninja");
expect(ninja.katana.name).to.eql("Katana");
expect(ninja.shuriken).to.eql(undefined);

container.bind<Shuriken>("Shuriken").to(Shuriken);

ninja = container.get<Ninja>("Ninja");
expect(ninja.name).to.eql("Ninja");
expect(ninja.katana.name).to.eql("Katana");
expect(ninja.shuriken.name).to.eql("Shuriken");
```

In the example we can see how the first time we resolve `Ninja`, its 
property `shuriken` is undefined because no bindings have been declared
for `Shuriken` and the property is annotated with the `@optional()` decorator.

After declaring a binding for `Shuriken`:

```ts
container.bind<Shuriken>("Shuriken").to(Shuriken);
```

All the resolved instances of `Ninja` will contain an instance of `Shuriken`.

## Default values
If a dependency is decorated with the `@optional()` decorator, we will be able to to declare
a default value just like you can do in any other TypeScript application:

```ts
@injectable()
class Ninja {
    public name: string;
    public katana: Katana;
    public shuriken: Shuriken;
    constructor(
        @inject("Katana") katana: Katana,
        @inject("Shuriken") @optional() shuriken: Shuriken = { name: "DefaultShuriken" } // Default value!
    ) {
        this.name = "Ninja";
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

Or using properties injection: 
```ts
@injectable()
class Ninja {
    public name = "Ninja";
    @inject("Katana") public katana: Katana;
    @inject("Shuriken") @optional() public shuriken: Shuriken = { name: "DefaultShuriken" } // Default value!
}
```