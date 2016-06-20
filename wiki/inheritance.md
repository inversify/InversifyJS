# Inheritance

```ts
interface Warrior {
    weapon: Weapon;
}

@injectable()
class Samurai implements Warrior {

    public weapon: Weapon;

    public constructor(weapon: Weapon) {
        this.weapon = weapon;
    }
}
```

The constructor of a derived class must be manually implemented and annotated. Therefore, the following code snippet:

```ts
@injectable()
class SamuraiMaster extends Samurai implements Warrior {
    public isMaster: boolean;
}
```

Throws an exception:

```
Error: Derived class must explicitly declare its constructor: SamuraiMaster
```

However, he following works:

```ts
@injectable()
class SamuraiMaster extends Samurai implements Warrior {
    public isMaster: boolean;
    public constructor(@inject(SYMBOLS.Weapon) weapon: Weapon) {
        super(weapon);
        this.isMaster = true;
    }
}
```

The above also works with `abstract` classes but it has one limitation. 
It doesn't work when a base class has constructor injections and its derived 
class don't have any constructor injections:

```ts
@injectable()
class Samurai implements Samurai {

    public rank: string;

    public constructor(rank: string) {
        this.rank = rank;
    }
}

@injectable()
class SamuraiMaster extends Samurai implements Samurai {
    constructor() {
        super("Master");
    }
}
```

The precedding code snippet throws an error. Unfortunately, as a result of 
the technical limitation, this error is misleading:

```
Error: Derived class must explicitly declare its constructor: SamuraiMaster.
```

You can overcome this limitation by injecting into the derived class:

```ts
kernel.bind<string>(SYMBOLS.RANK).toConstantValue("Master");

@injectable()
class Samurai implements Samurai {

    public rank: string;

    public constructor(rank: string) {
        this.rank = rank;
    }
}

@injectable()
class SamuraiMaster extends Samurai implements Samurai {
    constructor(@inject(SYMBOLS.RANK) rank: string) {
        super(rank);
    }
}
```
