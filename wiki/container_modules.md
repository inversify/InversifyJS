# Declaring container modules
Container modules can help you to manage the complexity of your bindings in very large applications.

```ts
let warriors = new ContainerModule((bind: Bind) => {
    bind<Ninja>("Ninja").to(Ninja);
});

let weapons = new ContainerModule((bind: Bind) => {
    bind<Katana>("Katana").to(Katana);
    bind<Shuriken>("Shuriken").to(Shuriken);
});

let container = new Container();
container.load(warriors, weapons);
container.unload(warriors);
```
