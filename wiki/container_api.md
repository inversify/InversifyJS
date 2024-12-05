# The Container API

The InversifyJS container is where dependencies are first configured through bind and, possibly later, reconfigured and removed. The container can be worked on directly in this regard or container modules can be utilized.
You can query the configuration and resolve configured dependencies with resolved and the 'get' methods.
You can react to resolutions with container activation handlers and unbinding with container deactivation handlers.
You can create container hierarchies where container ascendants can supply the dependencies for descendants.
For testing, state can be saved as a snapshot on a stack and later restored.
For advanced control you can apply middleware to intercept the resolution request and the resolved dependency.
You can even provide your own annotation solution.


## Container Options
Container options can be passed to the Container constructor and defaults will be provided if you do not or if you do but omit an option.
Options can be changed after construction and will be shared by child containers created from the Container if you do not provide options for them.

### defaultScope

The default scope is `transient` when binding to/toSelf/toDynamicValue/toService.
The other types of bindings are `singleton`.

You can use container options to change the default scope for the bindings that default to `transient` at application level:

```ts
let container = new Container({ defaultScope: "Singleton" });
```

For all types of bindings you can change the scope when declaring:

```ts
container.bind<Warrior>(TYPES.Warrior).to(Ninja).inSingletonScope();
container.bind<Warrior>(TYPES.Warrior).to(Ninja).inTransientScope();
container.bind<Warrior>(TYPES.Warrior).to(Ninja).inRequestScope();
```



### autoBindInjectable

You can use this to activate automatic binding for `@injectable()` decorated classes:

```ts
let container = new Container({ autoBindInjectable: true });
container.isBound(Ninja);          // returns false
container.get(Ninja);              // returns a Ninja
container.isBound(Ninja);          // returns true
```

Manually defined bindings will take precedence:

```ts
let container = new Container({ autoBindInjectable: true });
container.bind(Ninja).to(Samurai);
container.get(Ninja);              // returns a Samurai
```

### skipBaseClassChecks

You can use this to skip checking base classes for the @injectable property, which is
especially useful if any of your @injectable classes extend classes that you don't control
(third party classes). By default, this value is `false`.

```ts
let container = new Container({ skipBaseClassChecks: true });
```

## Container.merge(a: interfaces.Container, b: interfaces.Container, ...containers: interfaces.Container[]): interfaces.Container

Creates a new Container containing the bindings ( cloned bindings ) of two or more containers:

```ts
@injectable()
class Ninja {
    public name = "Ninja";
}

@injectable()
class Shuriken {
    public name = "Shuriken";
}

let CHINA_EXPANSION_TYPES = {
    Ninja: "Ninja",
    Shuriken: "Shuriken"
};

let chinaExpansionContainer = new Container();
chinaExpansionContainer.bind<Ninja>(CHINA_EXPANSION_TYPES.Ninja).to(Ninja);
chinaExpansionContainer.bind<Shuriken>(CHINA_EXPANSION_TYPES.Shuriken).to(Shuriken);

@injectable()
class Samurai {
    public name = "Samurai";
}

@injectable()
class Katana {
    public name = "Katana";
}

let JAPAN_EXPANSION_TYPES = {
    Katana: "Katana",
    Samurai: "Samurai"
};

let japanExpansionContainer = new Container();
japanExpansionContainer.bind<Samurai>(JAPAN_EXPANSION_TYPES.Samurai).to(Samurai);
japanExpansionContainer.bind<Katana>(JAPAN_EXPANSION_TYPES.Katana).to(Katana);

let gameContainer = Container.merge(chinaExpansionContainer, japanExpansionContainer);
expect(gameContainer.get<Ninja>(CHINA_EXPANSION_TYPES.Ninja).name).to.eql("Ninja");
expect(gameContainer.get<Shuriken>(CHINA_EXPANSION_TYPES.Shuriken).name).to.eql("Shuriken");
expect(gameContainer.get<Samurai>(JAPAN_EXPANSION_TYPES.Samurai).name).to.eql("Samurai");
expect(gameContainer.get<Katana>(JAPAN_EXPANSION_TYPES.Katana).name).to.eql("Katana");
```

## container.applyCustomMetadataReader(metadataReader: interfaces.MetadataReader): void

An advanced feature.... See [middleware](https://github.com/inversify/InversifyJS/blob/master/wiki/middleware.md).
## container.applyMiddleware(...middleware: interfaces.Middleware[]): void

An advanced feature that can be used for cross cutting concerns. See [middleware](https://github.com/inversify/InversifyJS/blob/master/wiki/middleware.md).

## container.bind\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>): interfaces.BindingToSyntax\<T>



## container.createChild(containerOptions?: interfaces.ContainerOptions): Container;

Create a [container hierarchy ](https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md).  If you do not provide options the child receives the options of the parent.

## container.get\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>): T

Resolves a dependency by its runtime identifier. The runtime identifier must be associated with only one binding and the binding must be synchronously resolved, otherwise an error is thrown:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana);

let katana = container.get<Weapon>("Weapon");
```

## container.getAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>): Promise\<T>

Resolves a dependency by its runtime identifier. The runtime identifier must be associated with only one binding, otherwise an error is thrown:

```ts
async function buildLevel1(): Level1 {
    return new Level1();
}

let container = new Container();
container.bind("Level1").toDynamicValue(() => buildLevel1());

let level1 = await container.getAsync<Level1>("Level1"); // Returns Promise<Level1>
```

## container.getNamed\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, named: string | number | symbol): T

Resolves a dependency by its runtime identifier that matches the given named constraint. The runtime identifier must be associated with only one binding and the binding must be synchronously resolved, otherwise an error is thrown:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("japanese");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("chinese");

let katana = container.getNamed<Weapon>("Weapon", "japanese");
let shuriken = container.getNamed<Weapon>("Weapon", "chinese");
```

## container.getNamedAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, named: string | number | symbol): Promise\<T>

Resolves a dependency by its runtime identifier that matches the given named constraint. The runtime identifier must be associated with only one binding, otherwise an error is thrown:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").toDynamicValue(async () => new Katana()).whenTargetNamed("japanese");
container.bind<Weapon>("Weapon").toDynamicValue(async () => new Weapon()).whenTargetNamed("chinese");

let katana = await container.getNamedAsync<Weapon>("Weapon", "japanese");
let shuriken = await container.getNamedAsync<Weapon>("Weapon", "chinese");
```

## container.getTagged\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, key: string | number | symbol, value: unknown): T

Resolves a dependency by its runtime identifier that matches the given tagged constraint. The runtime identifier must be associated with only one binding and the binding must be synchronously resolved, otherwise an error is thrown:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("faction", "samurai");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("faction", "ninja");

let katana = container.getTagged<Weapon>("Weapon", "faction", "samurai");
let shuriken = container.getTagged<Weapon>("Weapon", "faction", "ninja");
```

## container.getTaggedAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, key: string | number | symbol, value: unknown): Promise\<T>

Resolves a dependency by its runtime identifier that matches the given tagged constraint. The runtime identifier must be associated with only one binding, otherwise an error is thrown:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").toDynamicValue(async () => new Katana()).whenTargetTagged("faction", "samurai");
container.bind<Weapon>("Weapon").toDynamicValue(async () => new Weapon()).whenTargetTagged("faction", "ninja");

let katana = await container.getTaggedAsync<Weapon>("Weapon", "faction", "samurai");
let shuriken = await container.getTaggedAsync<Weapon>("Weapon", "faction", "ninja");
```

## container.getAll\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, options?: interfaces.GetAllOptions): T[]

Get all available bindings for a given identifier. All the bindings must be synchronously resolved, otherwise an error is thrown:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana);
container.bind<Weapon>("Weapon").to(Shuriken);

let weapons = container.getAll<Weapon>("Weapon");  // returns Weapon[]
```

Keep in mind `container.getAll` doesn't enforce binding contraints by default in the root level, enable the `enforceBindingConstraints` flag to force this binding constraint check:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana).when(() => true);
container.bind<Weapon>("Weapon").to(Shuriken).when(() => false);

let allWeapons = container.getAll<Weapon>("Weapon");  // returns [new Katana(), new Shuriken()]
let notAllWeapons = container.getAll<Weapon>(
  "Weapon",
  { enforceBindingConstraints: true },
);  // returns [new Katana()]
```

## container.getAllAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, options?: interfaces.GetAllOptions): Promise\<T[]>

Get all available bindings for a given identifier:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana);
container.bind<Weapon>("Weapon").toDynamicValue(async () => new Shuriken());

let weapons = await container.getAllAsync<Weapon>("Weapon");  // returns Promise<Weapon[]>
```

Keep in mind `container.getAll` doesn't enforce binding contraints by default in the root level, enable the `enforceBindingConstraints` flag to force this binding constraint check:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana).when(() => true);
container.bind<Weapon>("Weapon").to(Shuriken).when(() => false);

let allWeapons = await container.getAllAsync<Weapon>("Weapon");  // returns Promise.resolve([new Katana(), new Shuriken()])
let notAllWeapons = container.getAllAsync<Weapon>(
  "Weapon",
  { enforceBindingConstraints: true },
);  // returns Promise.resolve([new Katana()])
```

## container.getAllNamed\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, named: string | number | symbol): T[]

Resolves all the dependencies by its runtime identifier that matches the given named constraint. All the binding must be synchronously resolved, otherwise an error is thrown:

```ts
let container = new Container();

interface Intl {
    hello?: string;
    goodbye?: string;
}

container.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetNamed("fr");
container.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetNamed("fr");

container.bind<Intl>("Intl").toConstantValue({ hello: "hola" }).whenTargetNamed("es");
container.bind<Intl>("Intl").toConstantValue({ goodbye: "adios" }).whenTargetNamed("es");

let fr = container.getAllNamed<Intl>("Intl", "fr");
expect(fr.length).to.eql(2);
expect(fr[0].hello).to.eql("bonjour");
expect(fr[1].goodbye).to.eql("au revoir");

let es = container.getAllNamed<Intl>("Intl", "es");
expect(es.length).to.eql(2);
expect(es[0].hello).to.eql("hola");
expect(es[1].goodbye).to.eql("adios");
```

## container.getAllNamedAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, named: string | number | symbol): Promise\<T[]>

Resolves all the dependencies by its runtime identifier that matches the given named constraint:

```ts
let container = new Container();

interface Intl {
    hello?: string;
    goodbye?: string;
}

container.bind<Intl>("Intl").toDynamicValue(async () => ({ hello: "bonjour" })).whenTargetNamed("fr");
container.bind<Intl>("Intl").toDynamicValue(async () => ({ goodbye: "au revoir" })).whenTargetNamed("fr");

container.bind<Intl>("Intl").toDynamicValue(async () => ({ hello: "hola" })).whenTargetNamed("es");
container.bind<Intl>("Intl").toDynamicValue(async () => ({ goodbye: "adios" })).whenTargetNamed("es");

let fr = await container.getAllNamedAsync<Intl>("Intl", "fr");
expect(fr.length).to.eql(2);
expect(fr[0].hello).to.eql("bonjour");
expect(fr[1].goodbye).to.eql("au revoir");

let es = await container.getAllNamedAsync<Intl>("Intl", "es");
expect(es.length).to.eql(2);
expect(es[0].hello).to.eql("hola");
expect(es[1].goodbye).to.eql("adios");
```


## container.getAllTagged\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, key: string | number | symbol, value: unknown): T[]

Resolves all the dependencies by its runtime identifier that matches the given tagged constraint. All the binding must be synchronously resolved, otherwise an error is thrown:

```ts
let container = new Container();

interface Intl {
    hello?: string;
    goodbye?: string;
}

container.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetTagged("lang", "fr");
container.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetTagged("lang", "fr");

container.bind<Intl>("Intl").toConstantValue({ hello: "hola" }).whenTargetTagged("lang", "es");
container.bind<Intl>("Intl").toConstantValue({ goodbye: "adios" }).whenTargetTagged("lang", "es");

let fr = container.getAllTagged<Intl>("Intl", "lang", "fr");
expect(fr.length).to.eql(2);
expect(fr[0].hello).to.eql("bonjour");
expect(fr[1].goodbye).to.eql("au revoir");

let es = container.getAllTagged<Intl>("Intl", "lang", "es");
expect(es.length).to.eql(2);
expect(es[0].hello).to.eql("hola");
expect(es[1].goodbye).to.eql("adios");
```

## container.getAllTaggedAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, key: string | number | symbol, value: unknown): Promise\<T[]>

Resolves all the dependencies by its runtime identifier that matches the given tagged constraint:

```ts
let container = new Container();

interface Intl {
    hello?: string;
    goodbye?: string;
}

container.bind<Intl>("Intl").toDynamicValue(async () => ({ hello: "bonjour" })).whenTargetTagged("lang", "fr");
container.bind<Intl>("Intl").toDynamicValue(async () => ({ goodbye: "au revoir" })).whenTargetTagged("lang", "fr");

container.bind<Intl>("Intl").toDynamicValue(async () => ({ hello: "hola" })).whenTargetTagged("lang", "es");
container.bind<Intl>("Intl").toDynamicValue(async () => ({ goodbye: "adios" })).whenTargetTagged("lang", "es");

let fr = await container.getAllTaggedAsync<Intl>("Intl", "lang", "fr");
expect(fr.length).to.eql(2);
expect(fr[0].hello).to.eql("bonjour");
expect(fr[1].goodbye).to.eql("au revoir");

let es = await container.getAllTaggedAsync<Intl>("Intl", "lang", "es");
expect(es.length).to.eql(2);
expect(es[0].hello).to.eql("hola");
expect(es[1].goodbye).to.eql("adios");
```

## container.isBound(serviceIdentifier: interfaces.ServiceIdentifier\<unknown>): boolean

You can use the `isBound` method to check if there are registered bindings for a given service identifier.

```ts
interface Warrior {}
let warriorId = "Warrior";
let warriorSymbol = Symbol.for("Warrior");

@injectable()
class Ninja implements Warrior {}

interface Katana {}
let katanaId = "Katana";
let katanaSymbol = Symbol.for("Katana");

@injectable()
class Katana implements Katana {}

let container = new Container();
container.bind<Warrior>(Ninja).to(Ninja);
container.bind<Warrior>(warriorId).to(Ninja);
container.bind<Warrior>(warriorSymbol).to(Ninja);

expect(container.isBound(Ninja)).to.eql(true);
expect(container.isBound(warriorId)).to.eql(true);
expect(container.isBound(warriorSymbol)).to.eql(true);
expect(container.isBound(Katana)).to.eql(false);
expect(container.isBound(katanaId)).to.eql(false);
expect(container.isBound(katanaSymbol)).to.eql(false);
```


## container.isCurrentBound(serviceIdentifier: interfaces.ServiceIdentifier\<unknown>): boolean

You can use the `isCurrentBound` method to check if there are registered bindings for a given service identifier only in current container.

```ts
interface Warrior {}

@injectable()
class Ninja implements Warrior {}

const containerParent = new Container();
const containerChild = new Container();

containerChild.parent = containerParent;

containerParent.bind<Warrior>(Ninja).to(Ninja);

expect(containerParent.isBound(Ninja)).to.eql(true);
expect(containerParent.isCurrentBound(Ninja)).to.eql(true);

expect(containerChild.isBound(Ninja)).to.eql(true);
expect(containerChild.isCurrentBound(Ninja)).to.eql(false);
```

## container.isBoundNamed(serviceIdentifier: interfaces.ServiceIdentifier\<unknown>, named: string): boolean

You can use the `isBoundNamed` method to check if there are registered bindings for a given service identifier with a given named constraint.

```ts
const zero = "Zero";
const invalidDivisor = "InvalidDivisor";
const validDivisor = "ValidDivisor";
let container = new Container();

expect(container.isBound(zero)).to.eql(false);
container.bind<number>(zero).toConstantValue(0);
expect(container.isBound(zero)).to.eql(true);

container.unbindAll();
expect(container.isBound(zero)).to.eql(false);
container.bind<number>(zero).toConstantValue(0).whenTargetNamed(invalidDivisor);
expect(container.isBoundNamed(zero, invalidDivisor)).to.eql(true);
expect(container.isBoundNamed(zero, validDivisor)).to.eql(false);

container.bind<number>(zero).toConstantValue(1).whenTargetNamed(validDivisor);
expect(container.isBoundNamed(zero, invalidDivisor)).to.eql(true);
expect(container.isBoundNamed(zero, validDivisor)).to.eql(true);
```

## container.isBoundTagged(serviceIdentifier: interfaces.ServiceIdentifier\<unknown>, key: string, value: unknown): boolean

You can use the `isBoundTagged` method to check if there are registered bindings for a given service identifier with a given tagged constraint.

```ts
const zero = "Zero";
const isValidDivisor = "IsValidDivisor";
let container = new Container();

expect(container.isBound(zero)).to.eql(false);
container.bind<number>(zero).toConstantValue(0);
expect(container.isBound(zero)).to.eql(true);

container.unbindAll();
expect(container.isBound(zero)).to.eql(false);
container.bind<number>(zero).toConstantValue(0).whenTargetTagged(isValidDivisor, false);
expect(container.isBoundTagged(zero, isValidDivisor, false)).to.eql(true);
expect(container.isBoundTagged(zero, isValidDivisor, true)).to.eql(false);

container.bind<number>(zero).toConstantValue(1).whenTargetTagged(isValidDivisor, true);
expect(container.isBoundTagged(zero, isValidDivisor, false)).to.eql(true);
expect(container.isBoundTagged(zero, isValidDivisor, true)).to.eql(true);
```

## container.load(...modules: interfaces.ContainerModule[]): void

Calls the registration method of each module. See [container modules](https://github.com/inversify/InversifyJS/blob/master/wiki/container_modules.md)

## container.loadAsync(...modules: interfaces.AsyncContainerModule[]): Promise\<void>

As per load but for asynchronous registration. 

## container.rebind\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>): : interfaces.BindingToSyntax\<T>

You can use the `rebind` method to replace all the existing bindings for a given `serviceIdentifier`.
The function returns an instance of `BindingToSyntax` which allows to create the replacement binding.

```ts
let TYPES = {
    someType: "someType"
};

let container = new Container();
container.bind<number>(TYPES.someType).toConstantValue(1);
container.bind<number>(TYPES.someType).toConstantValue(2);

let values1 = container.getAll(TYPES.someType);
expect(values1[0]).to.eq(1);
expect(values1[1]).to.eq(2);

container.rebind<number>(TYPES.someType).toConstantValue(3);
let values2 = container.getAll(TYPES.someType);
expect(values2[0]).to.eq(3);
expect(values2[1]).to.eq(undefined);
```

## container.rebindAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>): Promise\<interfaces.BindingToSyntax\<T>>

This is an asynchronous version of rebind. If you know deactivation is asynchronous then this should be used.
If you are not sure then use this method !

## container.resolve\<T>(constructor: interfaces.Newable\<T>): T
Resolve is like `container.get<T>(serviceIdentifier: ServiceIdentifier<T>)` but it allows users to create an instance even if no bindings have been declared:

```ts
@injectable()
class Katana {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Ninja implements Ninja {
    public katana: Katana;
    constructor(katana: Katana) {
        this.katana = katana;
    }
    public fight() { return this.katana.hit(); }
}

const container: Container = new Container();
container.bind(Katana).toSelf();

const tryGet = () => container.get(Ninja);
expect(tryGet).to.throw("No matching bindings found for serviceIdentifier: Ninja");

const ninja = container.resolve(Ninja);
expect(ninja.fight()).to.eql("cut!");
```

Please note that it only allows to skip declaring a binding for the root element in the dependency graph (composition root). All the sub-dependencies (e.g. `Katana` in the preceding example) will require a binding to be declared.

## container.onActivation\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, onActivation: interfaces.BindingActivation\<T>): void

Adds an activation handler for all dependencies registered with the specified identifier.

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana);
container.onActivation("Weapon", (context: interfaces.Context, katana: Katana): Katana | Promise<Katana> => {
    console.log('katana instance activation!');
    return katana;
});

let katana = container.get<Weapon>("Weapon");
```

## onDeactivation\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, onDeactivation: interfaces.BindingDeactivation\<T>): void

Adds a deactivation handler for the dependencie's identifier.

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana);
container.onDeactivation("Weapon", (katana: Katana): void | Promise<void> => {
    console.log('katana instance deactivation!');
});

container.unbind("Weapon");
```

## container.restore(): void;

Restore container state to last snapshot.

## container.snapshot(): void

Save the state of the container to be later restored with the restore method.

## container.tryGet\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>): T | undefined

Same as `container.get`, but returns `undefined` in the event no bindings are bound to `serviceIdentifier`.

## container.tryGetAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>): Promise<T | undefined>

Same as `container.getAsync`, but returns `Promise<undefined>` in the event no bindings are bound to `serviceIdentifier`.

## container.tryGetNamed\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, named: string | number | symbol): T | undefined

Same as `container.getNamed`, but returns `undefined` in the event no bindings are bound to `serviceIdentifier`.

## container.tryGetNamedAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, named: string | number | symbol): Promise\<T | undefined>

Same as `container.getNamedAsync`, but returns `Promise<undefined>` in the event no bindings are bound to `serviceIdentifier`.

## container.tryGetTagged\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, key: string | number | symbol, value: unknown): T | undefined

Same as `container.getTagged`, but returns `undefined` in the event no bindings are bound to `serviceIdentifier`.

## container.tryGetTaggedAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, key: string | number | symbol, value: unknown): Promise\<T | undefined>

Same as `container.getTaggedAsync`, but returns `Promise<undefined>` in the event no bindings are bound to `serviceIdentifier`.

## container.tryGetAll\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, options?: interfaces.GetAllOptions): T[]

Same as `container.getAll`, but returns `[]` in the event no bindings are bound to `serviceIdentifier`.

## container.tryGetAllAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, options?: interfaces.GetAllOptions): Promise\<T[]>

Same as `container.getAllAsync`, but returns `Promise<[]>` in the event no bindings are bound to `serviceIdentifier`.

## container.tryGetAllNamed\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, named: string | number | symbol): T[]

Same as `container.getAllNamed`, but returns `[]` in the event no bindings are bound to `serviceIdentifier`.

## container.tryGetAllNamedAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, named: string | number | symbol): Promise\<T[]>

Same as `container.getAllNamedAsync`, but returns `Promise<[]>` in the event no bindings are bound to `serviceIdentifier`.

## container.tryGetAllTagged\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, key: string | number | symbol, value: unknown): T[]

Same as `container.getAllTagged`, but returns `[]` in the event no bindings are bound to `serviceIdentifier`.

## container.tryGetAllTaggedAsync\<T>(serviceIdentifier: interfaces.ServiceIdentifier\<T>, key: string | number | symbol, value: unknown): Promise\<T[]>

Same as `container.getAllTaggedAsync`, but returns `Promise<[]>` in the event no bindings are bound to `serviceIdentifier`.

## container.unbind(serviceIdentifier: interfaces.ServiceIdentifier\<unknown>): void

Remove all bindings binded in this container to the service identifier.  This will result in the [deactivation process](https://github.com/inversify/InversifyJS/blob/master/wiki/deactivation_handler.md).

## container.unbindAsync(serviceIdentifier: interfaces.ServiceIdentifier\<unknown>): Promise\<void>

This is the asynchronous version of unbind.  If you know deactivation is asynchronous then this should be used.
If you are not sure then use this method !

## container.unbindAll(): void

Remove all bindings binded in this container.  This will result in the [deactivation process](https://github.com/inversify/InversifyJS/blob/master/wiki/deactivation_handler.md).

## container.unbindAllAsync(): Promise\<void>

This is the asynchronous version of unbindAll.  If you know deactivation is asynchronous then this should be used.
If you are not sure then use this method !

## container.unload(...modules: interfaces.ContainerModuleBase[]): void

Removes bindings and handlers added by the modules.  This will result in the [deactivation process](https://github.com/inversify/InversifyJS/blob/master/wiki/deactivation_handler.md).
See [container modules](https://github.com/inversify/InversifyJS/blob/master/wiki/container_modules.md)

## container.unloadAsync(...modules: interfaces.ContainerModuleBase[]): Promise\<void>

Asynchronous version of unload.  If you know deactivation is asynchronous then this should be used.
If you are not sure then use this method !

## container.parent: Container | null;

Access the container hierarchy.

## container.id: number

An identifier auto generated to be unique.
