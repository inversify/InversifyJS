# The Container API

The InversifyJS container provides some helpers to resolve multi-injections
and ambiguous bindings.

## Container Options

The default scope is `transient` and you can change the scope of a type when declaring a binding:

```ts
container.bind<Warrior>(TYPES.Warrior).to(Ninja).inSingletonScope();
container.bind<Warrior>(TYPES.Warrior).to(Ninja).inTransientScope();
```

You can use container options to change the default scope used at application level:

```ts
let container = new Container({ defaultScope: "Singleton" });
```

## Container.merge(a: Container, b: Container)

Merges two containers into one:

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

## container.getNamed<T>()

Named bindings:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("japonese");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("chinese");

let katana = container.getNamed<Weapon>("Weapon", "japonese");
let shuriken = container.getNamed<Weapon>("Weapon", "chinese");
```

## container.getTagged<T>()

Tagged bindings:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("faction", "samurai");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("faction", "ninja");

let katana = container.getTagged<Weapon>("Weapon", "faction", "samurai");
let shuriken = container.getTagged<Weapon>("Weapon", "faction", "ninja");
```

## container.getAll<T>()

Get all available bindings for a given identifier:

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana);
container.bind<Weapon>("Weapon").to(Shuriken);

let weapons = container.getAll<Weapon>("Weapon");  // returns Weapon[]
```

## container.getAllNamed<T>()

Get all available bindings for a given identifier that match the given 
named constraint:

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


## container.getAllTagged<T>()

Get all available bindings for a given identifier that match the given 
named constraint:

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

## container.isBound(serviceIdentifier: ServiceIdentifier)

You can use the `isBound` method to check if there are registered bindings for a given service identifier.

```ts
interface Warrior {}
let warriorId = "Warrior";
let warriorSymbol = Symbol("Warrior");

@injectable()
class Ninja implements Warrior {}

interface Katana {}
let katanaId = "Katana";
let katanaSymbol = Symbol("Katana");

@injectable()
class Katana implements Katana {}

let container = new Container();
container.bind<Warrior>(Ninja).to(Ninja);
container.bind<Warrior>(warriorId).to(Ninja);
container.bind<Warrior>(warriorSymbol).to(Ninja);

container.isBound(Ninja)).eql(true);
container.isBound(warriorId)).eql(true);
container.isBound(warriorSymbol)).eql(true);
container.isBound(Katana)).eql(false);
container.isBound(katanaId)).eql(false);
container.isBound(katanaSymbol)).eql(false);
```

## container.isBoundNamed(serviceIdentifier: ServiceIdentifier<any>, named: string)

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

## container.isBoundTagged(serviceIdentifier: ServiceIdentifier<any>, key: string, value: any)

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

## container.rebind<T>(serviceIdentifier: ServiceIdentifier<T>)

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

## container.resolve<T>(constructor: Newable<T>)
Resolve is like `container.get<T>(serviceIdentifier: ServiceIdentifier<T>)` but it allows users to create an instance when if no bindings have been declared:

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
    public constructor(katana: Katana) {
        this.katana = katana;
    }
    public fight() { return this.katana.hit(); }
}

const container = new Container();
container.bind(Katana).toSelf();

const tryGet = () => container.get(Ninja);
expect(tryGet).to.throw("No matching bindings found for serviceIdentifier: Ninja");

const ninja = container.resolve(Ninja);
expect(ninja.fight()).to.eql("cut!");
```

Please note that it only allows to skip declaring a binding for the root element in the dependency graph (composition root). All the sub-dependencies (e.g. `Katana` in the preceding example) will require a binding to be declared.
