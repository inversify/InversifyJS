# Kernel.getAll<T>(), Kernel.getNamed<T>() & Kernel.getTagged<T>()
The InversifyJS kernel provides some helpers to resolve multi-injections:

```ts
let kernel = new Kernel();
kernel.bind<IWeapon>("IWeapon").to(Katana);
kernel.bind<IWeapon>("IWeapon").to(Shuriken);

let weapons = kernel.getAll<IWeapon[]>("IWeapon");
```

Named bindings:

```ts
let kernel = new Kernel();
kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetNamed("japonese");
kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetNamed("chinese");

let katana = kernel.getNamed<IWeapon>("IWeapon", "japonese");
let shuriken = kernel.getNamed<IWeapon>("IWeapon", "chinese");
```

And tagged bindings:

```ts
let kernel = new Kernel();
kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetTagged("faction", "samurai");
kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetTagged("faction", "ninja");

let katana = kernel.getTagged<IWeapon>("IWeapon", "faction", "samurai");
let shuriken = kernel.getTagged<IWeapon>("IWeapon", "faction", "ninja");
```
