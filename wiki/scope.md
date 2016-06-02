# Controlling the scope of the dependencies

InversifyJS uses transient scope by default but you can also use singleton scope:
```ts
kernel.bind<IShuriken>("IShuriken").to(Shuriken).inTransientScope(); // Default
kernel.bind<IShuriken>("IShuriken").to(Shuriken).inSingletonScope();
```
