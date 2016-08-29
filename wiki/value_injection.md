# Injecting a constant or dynamic value
Binds an abstraction to a constant value:
```ts
kernel.bind<Katana>("Katana").toConstantValue(new Katana());
```
Binds an abstraction to a dynamic value:
```ts
kernel.bind<Katana>("Katana").toDynamicValue((context: interfaces.Context) => { return new Katana(); });
```
