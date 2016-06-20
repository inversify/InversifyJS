# Declaring kernel modules
Kernel modules can help you to manage the complexity of your bindings in very large applications.

```ts
let warriors = new KernelModule((bind: Bind) => {
    bind<Ninja>("Ninja").to(Ninja);
});

let weapons = new KernelModule((bind: Bind) => {
    bind<Katana>("Katana").to(Katana);
    bind<Shuriken>("Shuriken").to(Shuriken);
});

let kernel = new Kernel();
kernel.load(warriors, weapons);
kernel.unload(warriors);
```
