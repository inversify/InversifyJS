# Declaring container modules

Container modules can help you to manage the complexity of your bindings in very large applications.

## Synchronous container modules

```ts
let warriors = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<Ninja>("Ninja").to(Ninja);
});

let weapons = new ContainerModule(
    (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind
    ) => {
        bind<Katana>("Katana").to(Katana);
        bind<Shuriken>("Shuriken").to(Shuriken);
    }
);

let container = new Container();
container.load(warriors, weapons);
container.unload(warriors);
```

## Asynchronous container modules

```ts
let warriors = new AsyncContainerModule(async (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    const ninja = await getNinja();
    bind<Ninja>("Ninja").toConstantValue(ninja);
});

let weapons = new AsyncContainerModule(
    (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind
    ) => {
        bind<Katana>("Katana").to(Katana);
        bind<Shuriken>("Shuriken").to(Shuriken);
    }
);

let container = new Container();
await container.loadAsync(warriors, weapons);
container.unload(warriors);
```
