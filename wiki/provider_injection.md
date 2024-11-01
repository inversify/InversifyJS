# Injecting a Provider (asynchronous Factory)

Binds an abstraction to a Provider. A provider is an asynchronous factory, this 
is useful when dealing with asynchronous  I/O operations.

```ts
type KatanaProvider = () => Promise<Katana>;

@injectable()
class Ninja implements Ninja {

    public katana: Katana;
    public shuriken: Shuriken;
    public katanaProvider: KatanaProvider;

    constructor(
        @inject("KatanaProvider") katanaProvider: KatanaProvider, 
        @inject("Shuriken") shuriken: Shuriken
    ) {
        this.katanaProvider = katanaProvider;
        this.katana = null;
        this.shuriken = shuriken;
    }

    public fight() { return this.katana.hit(); };
    public sneak() { return this.shuriken.throw(); };

}
```

```ts
container.bind<KatanaProvider>("KatanaProvider").toProvider<Katana>((context) => {
    return () => {
        return new Promise<Katana>((resolve) => {
            let katana = context.container.get<Katana>("Katana");
            resolve(katana);
        });
    };
});

var ninja = container.get<Ninja>("Ninja");

ninja.katanaProvider()
     .then((katana) => { ninja.katana = katana; })
     .catch((e) => { console.log(e); });
```

## Provider custom arguments
The `toProvider` binding expects a `ProviderCreator` as its only argument:

```ts
interface ProviderCreator<T> extends NewableFunction {
    (context: Context): Provider<T>;
}
```

The signature of a provider look as follows:

```ts
interface Provider<T> extends NewableFunction {
    (...args: unknown[]): (((...args: unknown[]) => Promise<T>) | Promise<T>);
}
```

These type signatures allow as to pass custom arguments to a provider:

```ts
let container = new Container();

interface Sword {
    material: string;
    damage: number;
}

@injectable()
class Katana implements Sword {
    public material: string;
    public damage: number;
}

type SwordProvider = (material: string, damage: number) => Promise<Sword>;

container.bind<Sword>("Sword").to(Katana);

container.bind<SwordProvider>("SwordProvider").toProvider<Sword>((context) => {
    return (material: string, damage: number) => { // Custom args!
        return new Promise<Sword>((resolve) => {
            setTimeout(() => {
                let katana = context.container.get<Sword>("Sword");
                katana.material = material;
                katana.damage = damage;
                resolve(katana);
            }, 10);
        });
    };
});

let katanaProvider = container.get<SwordProvider>("SwordProvider");

katanaProvider("gold", 100).then((powerfulGoldKatana) => { // Apply all custom args
    expect(powerfulGoldKatana.material).to.eql("gold");
    expect(powerfulGoldKatana.damage).to.eql(100);
});

katanaProvider("gold", 10).then((notSoPowerfulGoldKatana) => {
    expect(notSoPowerfulGoldKatana.material).to.eql("gold");
    expect(notSoPowerfulGoldKatana.damage).to.eql(10);
});
```

## Provider partial application

We can also pass the arguments using partial application:

```ts
let container = new Container();

interface Sword {
    material: string;
    damage: number;
}

@injectable()
class Katana implements Sword {
    public material: string;
    public damage: number;
}

type SwordProvider = (material: string) => (damage: number) => Promise<Sword>;

container.bind<Sword>("Sword").to(Katana);

container.bind<SwordProvider>("SwordProvider").toProvider<Sword>((context) => {
    return (material: string) => {  // Custom arg 1!
        return (damage: number) => { // Custom arg 2!
            return new Promise<Sword>((resolve) => {
                setTimeout(() => {
                    let katana = context.container.get<Sword>("Sword");
                    katana.material = material;
                    katana.damage = damage;
                    resolve(katana);
                }, 10);
            });
        };
    };
});

let katanaProvider = container.get<SwordProvider>("SwordProvider");
let goldKatanaProvider = katanaProvider("gold");  // Apply the first custom arg!

goldKatanaProvider(100).then((powerfulGoldKatana) => { // Apply the second custom args!
    expect(powerfulGoldKatana.material).to.eql("gold");
    expect(powerfulGoldKatana.damage).to.eql(100);
});

goldKatanaProvider(10).then((notSoPowerfulGoldKatana) => {
    expect(notSoPowerfulGoldKatana.material).to.eql("gold");
    expect(notSoPowerfulGoldKatana.damage).to.eql(10);
});
```

## Provider as a singleton
A Provider is always injected as a singleton but you can control if the value returned by the 
Provider is uses singleton or transient scope:

```ts
let container = new Container();

interface Warrior {
    level: number;
}

@injectable()
class Ninja implements Warrior {
    public level: number;
    constructor() {
        this.level = 0;
    }
}

type WarriorProvider = (level: number) => Promise<Warrior>;

container.bind<Warrior>("Warrior").to(Ninja).inSingletonScope(); // Value is singleton!

container.bind<WarriorProvider>("WarriorProvider").toProvider<Warrior>((context) => {
    return (increaseLevel: number) => {
        return new Promise<Warrior>((resolve) => {
            setTimeout(() => {
                let warrior = context.container.get<Warrior>("Warrior"); // Get singleton!
                warrior.level += increaseLevel;
                resolve(warrior);
            }, 100);
        });
    };
});

let warriorProvider = container.get<WarriorProvider>("WarriorProvider");

warriorProvider(10).then((warrior) => {
    expect(warrior.level).to.eql(10);
});

warriorProvider(10).then((warrior2) => {
    expect(warrior.level).to.eql(20);
});
```

## Provider defaults
The following function can be used as a helper to provide a default value when a provider is rejected:

```ts
function valueOrDefault<T>(provider: () => Promise<T>, defaultValue: T) {
    return new Promise<T>((resolve, reject) => {
        provider().then((value) => {
            resolve(value);
        }).catch(() => {
            resolve(defaultValue);
        });
    });
}
```

The following example showcases how to apply the `valueOrDefault` helper:

```ts
@injectable()
class Ninja {
    public level: number;
    public rank: string;
    constructor() {
        this.level = 0;
        this.rank = "Ninja";
    }
    public train(): Promise<number> {
        return new Promise<number>((resolve) => {
            setTimeout(() => {
                this.level += 10;
                resolve(this.level);
            }, 100);
        });
    }
}

@injectable()
class NinjaMaster {
    public rank: string;
    constructor() {
        this.rank = "NinjaMaster";
    }
}

type NinjaMasterProvider = () => Promise<NinjaMaster>;

let container = new Container();

container.bind<Ninja>("Ninja").to(Ninja).inSingletonScope();
container.bind<NinjaMasterProvider>("NinjaMasterProvider").toProvider((context) => {
    return () => {
        return new Promise<NinjaMaster>((resolve, reject) => {
            let ninja = context.container.get<Ninja>("Ninja");
            ninja.train().then((level) => {
                if (level >= 20) {
                    resolve(new NinjaMaster());
                } else {
                    reject("Not enough training");
                }
            });
        });
    };
});

let ninjaMasterProvider = container.get<NinjaMasterProvider>("NinjaMasterProvider");

valueOrDefault(ninjaMasterProvider, { rank: "DefaultNinjaMaster" }).then((ninjaMaster) => {
    // Using default here because the provider was rejected (the ninja has a level below 20)
    expect(ninjaMaster.rank).to.eql("DefaultNinjaMaster");
});

valueOrDefault(ninjaMasterProvider, { rank: "DefaultNinjaMaster" }).then((ninjaMaster) => {
    // A NinjaMaster was provided because the the ninja has a level above 20
    expect(ninjaMaster.rank).to.eql("NinjaMaster");
    done();
});
```
