# Inheritance

We try to provide developers with useful error feedback. This works fine in most cases but it causes some problem when using inheritance.

For example, the following code snippet throws a misleading error:

> The number of constructor arguments in a derived class must be >= than the number of constructor arguments of its base class.

```ts
@injectable()
class Warrior {
    public rank: string;
    constructor(rank: string) { // args count  = 1
        this.rank = rank;
    }
}

@injectable()
class SamuraiMaster extends Warrior {
    constructor() { // args count = 0
        super("master");
    }
}
```

In order to overcome this issues InversifyJS restricts the usage of inheritance with two rules:

> A derived class must explicitly declare its constructor.

> The number of constructor arguments in a derived class must be >= than the number of constructor arguments of its base class.

If you don't follow this rule an exception will be thrown:

> Error: The number of constructor arguments in the derived class SamuraiMaster must be >= than the number of constructor arguments of its base class.

The users have a few ways to overcome this limitation available:

### WORKAROUND A) Use the @unmanaged decorator

The `@unmanaged()` decorator allow users to flag that an argument will
be manually injected into a base class. We use the word "unmanaged"
because InversifyJS does not have control under user provided values
and it doesn't manage their injection.

The following code snippet showcases how to apply this decorator:

```ts
import { Container, injectable, unmanaged } from "../src/inversify";

const BaseId = "Base";

@injectable()
class Base {
    public prop: string;
    constructor(@unmanaged() arg: string) {
        this.prop = arg;
    }
}

@injectable()
class Derived extends Base {
    constructor() {
        super("unmanaged-injected-value");
    }
}

container.bind<Base>(BaseId).to(Derived);
let derived = container.get<Base>(BaseId);

derived instanceof Derived; // true
derived.prop; // "unmanaged-injected-value"
```

### WORKAROUND B) Property setter

You can use the `public`, `protected` or `private` access modifier and a
property setter to avoid injecting into the base class:

```ts
@injectable()
class Warrior {
    protected rank: string;
    constructor() { // args count = 0
        this.rank = null;
    }
}

@injectable()
class SamuraiMaster extends Warrior {
    constructor() { // args count = 0
        super();
        this.rank = "master";
    }
}
```

### WORKAROUND C) Property injection

We can also use property injection to avoid injecting into the base class:

```ts
@injectable()
class Warrior {
    protected rank: string;
    constructor() {} // args count = 0
}

let TYPES = { Rank: "Rank" };

@injectable()
class SamuraiMaster extends Warrior {
    @injectNamed(TYPES.Rank, "master")
    @named("master")
    protected rank: string;

    constructor() { // args count = 0
        super();
    }
}

container
    .bind<string>(TYPES.Rank)
    .toConstantValue("master")
    .whenTargetNamed("master");
```

### WORKAROUND D) Inject into the derived class

If we don't want to avoid injecting into the base class we can
inject into the derived class and then into the base class using
its constructor (super).

```ts
@injectable()
class Warrior {
    protected rank: string;
    constructor(rank: string) { // args count = 1
        this.rank = rank;
    }
}

let TYPES = { Rank: "Rank" };

@injectable()
class SamuraiMaster extends Warrior {
    constructor(
        @inject(TYPES.Rank) @named("master") rank: string // args count = 1
    ) {
        super(rank);
    }
}

container
    .bind<string>(TYPES.Rank)
    .toConstantValue("master")
    .whenTargetNamed("master");
```

The following should also work:

```ts
@injectable()
class Warrior {
    protected rank: string;
    constructor(rank: string) { // args count = 1
        this.rank = rank;
    }
}

interface Weapon {
    name: string;
}

@injectable()
class Katana implements Weapon {
    public name: string;
    constructor() {
        this.name = "Katana";
    }
}

let TYPES = {
    Rank: "Rank",
    Weapon: "Weapon",
};

@injectable()
class SamuraiMaster extends Warrior {
    public weapon: Weapon;
    constructor(
        @inject(TYPES.Rank) @named("master") rank: string, // args count = 2
        @inject(TYPES.Weapon) weapon: Weapon
    ) {
        super(rank);
        this.weapon = weapon;
    }
}

container.bind<Weapon>(TYPES.Weapon).to(Katana);

container
    .bind<string>(TYPES.Rank)
    .toConstantValue("master")
    .whenTargetNamed("master");
```

### WORKAROUND E) Skip Base class checks

Setting the `skipBaseClassChecks` option to `true` for the container will disable all checking of base classes. This means it will be completely up to the developer to ensure that the `super()` constructor is called with the correct arguments and at the correct time.

```ts
// Not injectable
class UnmanagedBase {
    constructor(public unmanagedDependency: string) {}
}

@injectable()
class InjectableDerived extends UnmanagedBase {
    constructor() // Any arguments defined here will be injected like normal
    {
        super("Don't forget me...");
    }
}

const container: Container = new Container({ skipBaseClassChecks: true });
container.bind(InjectableDerived).toSelf();
```

This will work, and you'll be able to use your `InjectableDerived` class just like normal, including injecting dependencies from elsewhere in the container through the constructor. The one caveat is that you must make sure your `UnmanagedBase` receives the correct arguments.

## What can I do when my base class is provided by a third party module?

In some cases, you may get errors about missing annotations in classes
provided by a third party module like:

> Error: Missing required @injectable annotation in: SamuraiMaster

You can overcome this problem using the `decorate` function:

```ts
import { decorate, injectable } from "inversify";
import SomeClass from "some-module";

decorate(injectable(), SomeClass);
return SomeClass;
```

Check out the [JS example](https://github.com/inversify/InversifyJS/blob/master/wiki/basic_js_example.md)
page on the wiki for more info.
