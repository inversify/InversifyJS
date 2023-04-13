# Injecting a constant or dynamic value
Binds an abstraction to a constant value:
```ts
container.bind<Katana>("Katana").toConstantValue(new Katana());
```
Binds an abstraction to a dynamic value:
```ts
container.bind<Katana>("Katana").toDynamicValue((context: interfaces.Context) => { return new Katana(); });
// a dynamic value can return a promise that will resolve to the value
container.bind<Katana>("Katana").toDynamicValue((context: interfaces.Context) => { return Promise.resolve(new Katana()); });
```

Binds an abstraction to a dynamic value with required dependencies from the container in a declarative way.
```ts
container.bind(AbstractShuriken).to(Shuriken)
container.bind(AbstractKatana).to(Katana)
container.bind(Ninja).toDynamicValueWithDeps(
    [AbstractShuriken, AbstractKatana] as const,
    ([shuriken, katana]) => new Ninja(shuriken, katana)
)
```
