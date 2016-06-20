# The Kernel API

The InversifyJS kernel provides some helpers to resolve multi-injections.

## Kernel.getAll<T>()
```ts
let kernel = new Kernel();
kernel.bind<Weapon>("Weapon").to(Katana);
kernel.bind<Weapon>("Weapon").to(Shuriken);

let weapons = kernel.getAll<Weapon[]>("Weapon");
```

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
