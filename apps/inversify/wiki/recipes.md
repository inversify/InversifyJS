# Recipes
This page contains some code snippets that showcase concrete advanced use cases AKA "recipes".

## Injecting dependencies into a function

You need to start by declaring your bindings just like in any other case:
```ts
let TYPES: {
    something: "something",
    somethingElse: "somethingElse"
};

export { TYPES };
```

```ts
let inversify = require("inversify");
import { TYPES } from "./constants/types";

// declare your container
let container = new inversify.Container();
container.bind(TYPES.something).toConstantValue(1);
container.bind(TYPES.somethingElse).toConstantValue(2);

export { container };
```

Continue by declaring the following helper function:

```ts
import { container } from "./inversify.config"

function bindDependencies(func, dependencies) {
    let injections = dependencies.map((dependency) => {
        return container.get(dependency);
    });
    return func.bind(func, ...injections);
}

export { bindDependencies };
```

Declare your function and bind its dependencies to its arguments using the `bindDependencies` helper:

```ts
import { bindDependencies } from "./utils/bindDependencies";
import { TYPES } from "./constants/types";

function testFunc(something, somethingElse) {
  console.log(`Injected! ${something}`);
  console.log(`Injected! ${somethingElse}`);
}

testFunc = bindDependencies(testFunc, [TYPES.something, TYPES.somethingElse]);

export { testFunc };
```

Use your function :smile:

```ts
import { testFunc } from "./x/test_func";

testFunc();

// > Injected! 1
// > Injected! 2
```

## Overriding bindings on unit tests

Sometimes you want to use your binding declarations in your unit test but you need to override some of them. We recommend you to declare your bindings as container modules inside your application:

```ts
let warriors = new ContainerModule((bind: Bind) => {
    bind<Ninja>("Ninja").to(Ninja);
});

let weapons = new ContainerModule((bind: Bind) => {
    bind<Katana>("Katana").to(Katana);
    bind<Shuriken>("Shuriken").to(Shuriken);
});

export { warriors, weapons };
```

You will then be able to create a new container using the bindings from your application:

```ts
import { warriors, weapons} from './shared/container_modules';
import { Container } from "inversify";

describe("something", () => {

  let container: Container;

  beforeEach(() => {
      container = new Container();
      container.load(warriors, weapons);
  });

  afterEach(() => {
      container = null;
  });

  it("Should...", () => {
      container.unbind(MyService);
      container.bind(MyService).to(MyServiceMock);
      // do something
  });

});
```

As you can see you can then override specific bindings in each test case.

## Using request scope and activation handlers to avoid factories when working with circular dependenies

If we have a case with a circular dependency like for example:

- `Warrior` has a property named `weapon` which is a `Weapon` instance.
- `Weapon` has a property named `owner` which is a `Warrior` instance.

We can solve this problem using a factory:

```ts
import { inject, injectable, Container, interfaces } from "inversify";
import "reflect-metadata";

type FactoryOfWeapon = (parent: IWeaponHolder) => IWeapon;

const TYPE = {
    OrphanWeapon: Symbol.for("OrphanWeapon"),
    FactoryOfWeapon: Symbol.for("FactoryOfWeapon"),
    WeaponName: Symbol.for("WeaponName"),
    WeaponHolder: Symbol.for("WeaponHolder")
};

interface IWeapon {
    parent: IWeaponHolder;
    use(): string;
    owner(): string;
}

interface IWeaponHolder {
    name: string;
    weapon: IWeapon;
    fight(): string;
}

@injectable()
class Weapon implements IWeapon {
    private readonly _name: string;
    public parent: IWeaponHolder;

    public constructor(
        // We can inject stuff into Weapon
        @inject(TYPE.WeaponName) name: string
    ) {
        this._name = name;
    }

    public use() {
        return this._name;
    }

    public owner() {
        return `Owned by ${this.parent.name}!`;
    }

}

@injectable()
class Character implements IWeaponHolder {
    public weapon: IWeapon;
    public name: string;
    public constructor(
        @inject(TYPE.FactoryOfWeapon) factoryOfWeapon: FactoryOfWeapon
    ) {
        this.name = "Ninja";
        this.weapon = factoryOfWeapon(this);
    }
    public fight() {
        return `Using ${this.weapon.use()}!`;
    }
}

const container = new Container();

// We inject a string just to demostrate that we can inject stuff into Weapon
container.bind<string>(TYPE.WeaponName).toConstantValue("Katana");

// We declare a binding for Weapon so we can use it within the factory
container.bind<IWeapon>(TYPE.OrphanWeapon).to(Weapon);

container.bind<FactoryOfWeapon>(TYPE.FactoryOfWeapon).toFactory<IWeapon,[IWeaponHolder]>(
    (ctx: interfaces.Context) => {
        return (parent: IWeaponHolder) => {
            const orphanWeapon = ctx.container.get<IWeapon>(TYPE.OrphanWeapon);
            orphanWeapon.parent = parent;
            return orphanWeapon;
        };
    });

container.bind<IWeaponHolder>(TYPE.WeaponHolder).to(Character);

const character = container.get<IWeaponHolder>(TYPE.WeaponHolder);
console.log(character.fight());
console.log(character.weapon.owner());
```

But if for some reason we really want to avoid factories, we can use request scope and activation handlers to avoid factories:

```ts
import { inject, injectable, Container, interfaces } from "inversify";
import "reflect-metadata";

type FactoryOfWeapon = (parent: IWeaponHolder) => IWeapon;

const TYPE = {
    WeaponName: Symbol.for("WeaponName"),
    WeaponHolder: Symbol.for("WeaponHolder"),
    Weapon: Symbol.for("Weapon")
};

interface IWeapon {
    parent: IWeaponHolder;
    use(): string;
    owner(): string;
}

interface IWeaponHolder {
    name: string;
    weapon: IWeapon;
    fight(): string;
}

@injectable()
class Weapon implements IWeapon {
    private readonly _name: string;
    public parent: IWeaponHolder;

    public constructor(
        // We can inject stuff into Weapon
        @inject(TYPE.WeaponName) name: string
    ) {
        this._name = name;
    }

    public use() {
        return this._name;
    }

    public owner() {
        return `Owned by ${this.parent.name}!`;
    }

}

@injectable()
class Character implements IWeaponHolder {
    public weapon: IWeapon;
    public name: string;
    public constructor(
        @inject(TYPE.Weapon) weapon: IWeapon
    ) {
        this.name = "Ninja";
        this.weapon = weapon; // No need for factory :)
    }
    public fight() {
        return `Using ${this.weapon.use()}!`;
    }
}

const container = new Container();

// We inject a string just to demostrate that we can inject stuff into Weapon
container.bind<string>(TYPE.WeaponName).toConstantValue("Katana");

// The inRequestScope is important here
container.bind<IWeapon>(TYPE.Weapon).to(Weapon).inRequestScope();

// We can use onActivation and search for Weapon in the inRequestScope
container.bind<IWeaponHolder>(TYPE.WeaponHolder)
    .to(Character)
    .onActivation((ctx: interfaces.Context, weaponHolderInstance: IWeaponHolder) => {
        const scope = ctx.plan.rootRequest.requestScope;
        if (scope) {
            // We search in the entire inRequestScope, this
            // takes O(n) execution time so It is slower than the factory
            const weaponInstance = Array.from(scope.values())
                                        .find(v => v instanceof Weapon);
            weaponInstance.parent = weaponHolderInstance;
        }
        return weaponHolderInstance;
    });

const character = container.get<IWeaponHolder>(TYPE.WeaponHolder);

console.log(character.fight()); // Using Katana!
console.log(character.weapon.owner()); // Owned by Ninja!.
```

Please note that this workaround is somehow fragile and it will not work with all kinds of contextual constraints. The `onActivation` might need additional logic to handle more complex scenarios.
