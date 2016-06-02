#### Injecting a Provider (asynchronous Factory)
Binds an abstraction to a Provider. A provider is an asynchronous factory, this is useful when dealing with asynchronous  I/O operations.
```ts
@injectable()
class Ninja implements INinja {

    public katana: IKatana;
    public shuriken: IShuriken;
    public katanaProvider: IProvider<IKatana>;

    public constructor(
	    @inject("IProvider<IKatana>") katanaProvider: IProvider<IKatana>, 
	    @inject("IShuriken") shuriken: IShuriken
    ) {
        this.katanaProvider = katanaProvider;
        this.katana= null;
        this.shuriken = shuriken;
    }

    public fight() { return this.katana.hit(); };
    public sneak() { return this.shuriken.throw(); };

}
```

```ts
kernel.bind<IProvider<IKatana>>("IProvider<IKatana>").toProvider<IKatana>((context) => {
    return () => {
        return new Promise<IKatana>((resolve) => {
            let katana = context.kernel.get<IKatana>("IKatana");
            resolve(katana);
        });
    };
});

var ninja = kernel.get<INinja>("INinja");

ninja.katanaProvider()
     .then((katana) => { ninja.katana = katana; })
     .catch((e) => { console.log(e); });
```
