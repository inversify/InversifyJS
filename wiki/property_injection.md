#### Property injection
InversifyJS supports property injection because sometimes constructor injection is not the best kind of injection pattern.
```ts
let kernel = new Kernel();
let inject = makePropertyInjectDecorator(kernel);

interface ISomeService {
    count: number;
    increment(): void;
}

@injectable()
class SomeService implements ISomeService {
    public count: number;
    public constructor() {
        this.count = 0;
    }
    public increment() {
        this.count = this.count + 1;
    }
}

class SomeWebComponent {
    @inject("ISomeService")
    private _service: ISomeService;
    public doSomething() {
        let count =  this._service.count;
        this._service.increment();
        return count;
    }
}

kernel.bind<ISomeService>("ISomeService").to(SomeService);

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

    @injectNamed(TYPES.IWeapon, "not-throwwable")
    @named("not-throwwable")
    public primaryWeapon: IWeapon;

    @injectNamed(TYPES.IWeapon, "throwwable")
    @named("throwwable")
    public secondaryWeapon: IWeapon;

}

class Warrior {

    @injectTagged(TYPES.IWeapon, "throwwable", false)
    @tagged("throwwable", false)
    public primaryWeapon: IWeapon;

    @injectTagged(TYPES.IWeapon, "throwwable", true)
    @tagged("throwwable", true)
    public secondaryWeapon: IWeapon;

}
```
- Property injection supports multi-injection.

```ts
let kernel = new Kernel();
let multiInject = makePropertyMultiInjectDecorator(kernel);

let TYPES = { IWeapon: "IWeapon" };

interface IWeapon {
    durability: number;
    use(): void;
}

@injectable()
class Sword implements IWeapon {
    public durability: number;
    public constructor() {
        this.durability = 100;
    }
    public use() {
        this.durability = this.durability - 10;
    }
}

@injectable()
class WarHammer implements IWeapon {
    public durability: number;
    public constructor() {
        this.durability = 100;
    }
    public use() {
        this.durability = this.durability - 10;
    }
}

class Warrior {
    @multiInject(TYPES.IWeapon)
    public weapons: IWeapon[];
}

kernel.bind<IWeapon>(TYPES.IWeapon).to(Sword);
kernel.bind<IWeapon>(TYPES.IWeapon).to(WarHammer);

let warrior1 = new Warrior();

expect(warrior1.weapons[0]).to.be.instanceof(Sword);
expect(warrior1.weapons[1]).to.be.instanceof(WarHammer);
```
