# The Kernel API

The InversifyJS kernel provides some helpers to resolve multi-injections 
and ambiguous bindings.

## Kernel.getNamed<T>()
Named bindings:

```ts
let kernel = new Kernel();
kernel.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("japonese");
kernel.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("chinese");

let katana = kernel.getNamed<Weapon>("Weapon", "japonese");
let shuriken = kernel.getNamed<Weapon>("Weapon", "chinese");
```

## Kernel.getTagged<T>()
Tagged bindings:

```ts
let kernel = new Kernel();
kernel.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("faction", "samurai");
kernel.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("faction", "ninja");

let katana = kernel.getTagged<Weapon>("Weapon", "faction", "samurai");
let shuriken = kernel.getTagged<Weapon>("Weapon", "faction", "ninja");
```

## Kernel.getAll<T>()
Get all available bindings for a given identifier:
```ts
let kernel = new Kernel();
kernel.bind<Weapon>("Weapon").to(Katana);
kernel.bind<Weapon>("Weapon").to(Shuriken);

let weapons = kernel.getAll<Weapon>("Weapon");  // returns Weapon[]
```

## Kernel.getAllNamed<T>()
Get all available bindings for a given identifier that match the given 
named constraint:
```ts
let kernel = new Kernel();

interface Intl {
    hello?: string;
    goodbye?: string;
}

kernel.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetNamed("fr");
kernel.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetNamed("fr");

kernel.bind<Intl>("Intl").toConstantValue({ hello: "hola" }).whenTargetNamed("es");
kernel.bind<Intl>("Intl").toConstantValue({ goodbye: "adios" }).whenTargetNamed("es");

let fr = kernel.getAllNamed<Intl>("Intl", "fr");
expect(fr.length).to.eql(2);
expect(fr[0].hello).to.eql("bonjour");
expect(fr[1].goodbye).to.eql("au revoir");

let es = kernel.getAllNamed<Intl>("Intl", "es");
expect(es.length).to.eql(2);
expect(es[0].hello).to.eql("hola");
expect(es[1].goodbye).to.eql("adios");
```


## Kernel.getAllTagged<T>()
Get all available bindings for a given identifier that match the given 
named constraint:
```ts
let kernel = new Kernel();

interface Intl {
    hello?: string;
    goodbye?: string;
}

kernel.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetTagged("lang", "fr");
kernel.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetTagged("lang", "fr");

kernel.bind<Intl>("Intl").toConstantValue({ hello: "hola" }).whenTargetTagged("lang", "es");
kernel.bind<Intl>("Intl").toConstantValue({ goodbye: "adios" }).whenTargetTagged("lang", "es");

let fr = kernel.getAllTagged<Intl>("Intl", "lang", "fr");
expect(fr.length).to.eql(2);
expect(fr[0].hello).to.eql("bonjour");
expect(fr[1].goodbye).to.eql("au revoir");

let es = kernel.getAllTagged<Intl>("Intl", "lang", "es");
expect(es.length).to.eql(2);
expect(es[0].hello).to.eql("hola");
expect(es[1].goodbye).to.eql("adios");
```

## Kernel.isBound()
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

let kernel = new Kernel();
kernel.bind<Warrior>(Ninja).to(Ninja);
kernel.bind<Warrior>(warriorId).to(Ninja);
kernel.bind<Warrior>(warriorSymbol).to(Ninja);

kernel.isBound(Ninja)).eql(true);
kernel.isBound(warriorId)).eql(true);
kernel.isBound(warriorSymbol)).eql(true);
kernel.isBound(Katana)).eql(false);
kernel.isBound(katanaId)).eql(false);
kernel.isBound(katanaSymbol)).eql(false);
```
