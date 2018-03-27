# 声明容器模块

容器模块可以帮助您在非常大的应用程序中管理绑定的复杂性。

## 同步容器模块

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

## 异步容器模块

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
