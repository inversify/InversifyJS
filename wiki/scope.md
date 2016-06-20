# Controlling the scope of the dependencies

InversifyJS uses transient scope by default but you can also use singleton scope:

```ts
kernel.bind<Shuriken>("Shuriken").to(Shuriken).inTransientScope(); // Default
kernel.bind<Shuriken>("Shuriken").to(Shuriken).inSingletonScope();
```
