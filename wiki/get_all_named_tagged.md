# The Kernel API

The InversifyJS kernel provides some helpers to resolve multi-injections.

## Kernel.getAll<T>()
```ts
let kernel = new Kernel();
kernel.bind<IWeapon>("IWeapon").to(Katana);
kernel.bind<IWeapon>("IWeapon").to(Shuriken);

let weapons = kernel.getAll<IWeapon[]>("IWeapon");
```

## Kernel.getNamed<T>()
Named bindings:

```ts
let kernel = new Kernel();
kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetNamed("japonese");
kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetNamed("chinese");

let katana = kernel.getNamed<IWeapon>("IWeapon", "japonese");
let shuriken = kernel.getNamed<IWeapon>("IWeapon", "chinese");
```

## Kernel.getTagged<T>()
Tagged bindings:

```ts
let kernel = new Kernel();
kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetTagged("faction", "samurai");
kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetTagged("faction", "ninja");

let katana = kernel.getTagged<IWeapon>("IWeapon", "faction", "samurai");
let shuriken = kernel.getTagged<IWeapon>("IWeapon", "faction", "ninja");
```

## Kernel.isBound()
You can use the `isBound` method to check if there are registered bindings for a given service identifier.
```ts
interface IWarrior {}
let warriorId = "IWarrior";
let warriorSymbol = Symbol("IWarrior");

@injectable()
class Ninja implements IWarrior {}

interface IKatana {}
let katanaId = "IKatana";
let katanaSymbol = Symbol("IKatana");

@injectable()
class Katana implements IKatana {}

let kernel = new Kernel();
kernel.bind<IWarrior>(Ninja).to(Ninja);
kernel.bind<IWarrior>(warriorId).to(Ninja);
kernel.bind<IWarrior>(warriorSymbol).to(Ninja);

kernel.isBound(Ninja)).eql(true);
kernel.isBound(warriorId)).eql(true);
kernel.isBound(warriorSymbol)).eql(true);
kernel.isBound(Katana)).eql(false);
kernel.isBound(katanaId)).eql(false);
kernel.isBound(katanaSymbol)).eql(false);
```
