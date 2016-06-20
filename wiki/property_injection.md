# Property injection
InversifyJS supports property injection because sometimes constructor injection is not the best kind of injection pattern.
```ts
let kernel = new Kernel();
let inject = makePropertyInjectDecorator(kernel);

interface SomeService {
    count: number;
    increment(): void;
}

@injectable()
class SomeService implements SomeService {
    public count: number;
    public constructor() {
        this.count = 0;
    }
    public increment() {
        this.count = this.count + 1;
    }
}

class SomeWebComponent {
    @inject("SomeService")
    private _service: SomeService;
    public doSomething() {
        let count =  this._service.count;
        this._service.increment();
        return count;
    }
}

kernel.bind<SomeService>("SomeService").to(SomeService);

let someComponent = new SomeWebComponent();
expect(someComponent.doSomething()).eql(0);
expect(someComponent.doSomething()).eql(1);
```

Property injection is quite different of constructor injection and has some limitations.

- The `@inject` decorator requires an instance of kernel.
- Injection takes place the first time the property is accessed via its getter.
- The `@targetName` decorator is not supported.
- The only supported contextual constraints are `whenTargetNamed` and `whenTargetTagged`.
- Property injection supports the `@named` and `@tagged` decorators.
- The function `Object.prototype.propertyIsEnumerable()` returns false for properties decorated with `@inject`. 
This is caused because the declared class property is replaced by a new instance property once the injection takes place. 
The `propertyIsEnumerable` function returns `false` for properties that return `false` for `hasOwnProperty`.

```ts
class Warrior {

    @injectNamed(TYPES.Weapon, "not-throwwable")
    @named("not-throwwable")
    public primaryWeapon: Weapon;

    @injectNamed(TYPES.Weapon, "throwwable")
    @named("throwwable")
    public secondaryWeapon: Weapon;

}

class Warrior {

    @injectTagged(TYPES.Weapon, "throwwable", false)
    @tagged("throwwable", false)
    public primaryWeapon: Weapon;

    @injectTagged(TYPES.Weapon, "throwwable", true)
    @tagged("throwwable", true)
    public secondaryWeapon: Weapon;

}
```
- Property injection supports multi-injection.

```ts
let kernel = new Kernel();
let multiInject = makePropertyMultiInjectDecorator(kernel);

let TYPES = { Weapon: "Weapon" };

interface Weapon {
    durability: number;
    use(): void;
}

@injectable()
class Sword implements Weapon {
    public durability: number;
    public constructor() {
        this.durability = 100;
    }
    public use() {
        this.durability = this.durability - 10;
    }
}

@injectable()
class WarHammer implements Weapon {
    public durability: number;
    public constructor() {
        this.durability = 100;
    }
    public use() {
        this.durability = this.durability - 10;
    }
}

class Warrior {
    @multiInject(TYPES.Weapon)
    public weapons: Weapon[];
}

kernel.bind<Weapon>(TYPES.Weapon).to(Sword);
kernel.bind<Weapon>(TYPES.Weapon).to(WarHammer);

let warrior1 = new Warrior();

expect(warrior1.weapons[0]).to.be.instanceof(Sword);
expect(warrior1.weapons[1]).to.be.instanceof(WarHammer);
```
