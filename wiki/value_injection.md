#### Injecting a constant or dynamic value
Binds an abstraction to a constant value:
```ts
kernel.bind<IKatana>("IKatana").toConstantValue(new Katana());
```
Binds an abstraction to a dynamic value:
```ts
kernel.bind<IKatana>("IKatana").toDynamicValue(() => { return new Katana(); });
```
