# Inheritance

We try to provide developers with useful error feedback like:

> Error: Missing required @injectable annotation in: SamuraiMaster

This works fine in most cases but it causes some problem when using inheritance. 

For example, the following code snippet throw a misleading error:

> Error: Derived class must explicitly declare its constructor: SamuraiMaster

```ts
@injectable()
class Warrior {
    public rank: string;
    public constructor(rank: string) { // args count  = 1
        this.rank = rank;
    }
}

@injectable()
class SamuraiMaster extends Warrior  {
    public constructor() { // args count = 0
       super("master");
    }
}
```

In order to overcome this issues InversifyJS restricts the usage of inheritance.

> The number of constructor arguments in a derived class must be >= than the number of constructor arguments of its base class.

If you don't follow this rule and exception will be thrown:

> Error: The number of constructor arguments in the derived class SamuraiMaster must be >= than the number of constructor arguments of its base class.

The users have a few ways to overcome this limitation available:

### WORKAROUND A) Property setter

You can use the `public`, `protected` or `private` access modifier and a 
property setter to avoid injecting into the base class:

```ts
@injectable()
class Warrior {
    protected rank: string;
    public constructor() { // args count = 0
        this.rank = null;
    }
}

@injectable()
class SamuraiMaster extends Warrior {
    public constructor() { // args count = 0
       super();
	   this.rank = "master";
    }
}
```

### WORKAROUND B) Property injection

We can also use property injection to avoid injecting into the base class:

```ts
@injectable()
class Warrior {
    protected rank: string;
    public constructor() {} // args count = 0
}

let TYPES = { Rank: "Rank" };

@injectable()
class SamuraiMaster extends Warrior  {

    @injectNamed(TYPES.Rank, "master")
    @named("master")
    protected rank: string;
	
    public constructor() { // args count = 0
       super();
    }
}

kernel.bind<string>(TYPES.Rank)
      .toConstantValue("master")
	  .whenTargetNamed("master");
```

### WORKAROUND C) Inject into the derived class

If we don't want to avoid injecting into the base class we can 
inject into the derived class and then into the base class using 
its constructor (super).

```ts
@injectable()
class Warrior {
    protected rank: string;
    public constructor(rank: string) { // args count = 1
        this.rank = rank;
    }
}

let TYPES = { Rank: "Rank" };

@injectable()
class SamuraiMaster extends Warrior  {
    public constructor(
		@inject(TYPES.Rank) @named("master") rank: string // args count = 1
	) {
       super(rank);
    }
}

kernel.bind<string>(TYPES.Rank)
      .toConstantValue("master")
	  .whenTargetNamed("master");
```

The following should also work:

```ts
@injectable()
class Warrior {
    protected rank: string;
    public constructor(rank: string) { // args count = 1
        this.rank = rank;
    }
}

interface Weapon {
	name: string;
}

@injectable()
class Katana implements Weapon {
	public name: string;
	public constructor() {
		this.name = "Katana";
	}
}

let TYPES = { 
    Rank: "Rank",
    Weapon: "Weapon"
};

@injectable()
class SamuraiMaster extends Warrior  {
	public weapon: Weapon;
    public constructor(
		@inject(TYPES.Rank) @named("master") rank: string, // args count = 2
		@inject(TYPES.Weapon) weapon: Weapon
	) {
       super(rank);
	   this.weapon = weapon;
    }
}

kernel.bind<Weapon>(TYPES.Weapon).to(Katana);

kernel.bind<string>(TYPES.Rank)
      .toConstantValue("master")
      .whenTargetNamed("master");

```
