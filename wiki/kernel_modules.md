# Declaring kernel modules
Kernel modules can help you to manage the complexity of your bindings in very large applications.
```ts
let warriors: IKernelModule = (k: IKernel) => {
    k.bind<INinja>("INinja").to(Ninja);
};

let weapons: IKernelModule = (k: IKernel) => {
    k.bind<IKatana>("IKatana").to(Katana).inTransientScope();
    k.bind<IShuriken>("IShuriken").to(Shuriken).inSingletonScope();
};

kernel = new Kernel();
kernel.load(warriors, weapons);
```
