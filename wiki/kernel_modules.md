# Declaring kernel modules
Kernel modules can help you to manage the complexity of your bindings in very large applications.
```ts
let warriors = new KernelModule((bind: IBind) => {
    bind<INinja>("INinja").to(Ninja);
});

let weapons = new KernelModule((bind: IBind) => {
    bind<IKatana>("IKatana").to(Katana);
    bind<IShuriken>("IShuriken").to(Shuriken);
});

let kernel = new Kernel();
kernel.load(warriors, weapons);
```
