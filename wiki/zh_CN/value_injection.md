# 注入一个常量或者动态值

绑定一个抽象到常量：

```ts
container.bind<Katana>("Katana").toConstantValue(new Katana());
```

绑定一个抽象到动态值：

```ts
container.bind<Katana>("Katana").toDynamicValue((context: interfaces.Context) => { return new Katana(); });
```
