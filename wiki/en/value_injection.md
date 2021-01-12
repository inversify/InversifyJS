# Injecting a constant or dynamic value
Binds an abstraction to a constant value:
```ts
container.bind<Katana>("Katana").toConstantValue(new Katana());
```
Binds an abstraction to a dynamic value:
```ts
container.bind<Katana>("Katana").toDynamicValue((context: interfaces.Context) => { return new Katana(); });
```
