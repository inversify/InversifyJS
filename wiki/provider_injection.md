# Injecting a Provider (asynchronous Factory)

Binds an abstraction to a Provider. A provider is an asynchronous factory, this is useful when dealing with asynchronous  I/O operations.

```ts
@injectable()
class Ninja implements Ninja {

    public katana: Katana;
    public shuriken: Shuriken;
    public katanaProvider: Provider<Katana>;

    public constructor(
	    @inject("Provider<Katana>") katanaProvider: Provider<Katana>, 
	    @inject("Shuriken") shuriken: Shuriken
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
container.bind<interfaces.Provider<Katana>>("Provider<Katana>").toProvider<Katana>((context) => {
    return () => {
        return new Promise<Katana>((resolve) => {
            let katana = context.container.get<Katana>("Katana");
            resolve(katana);
        });
    };
});

var ninja = container.get<Ninja>("Ninja");

ninja.katanaProvider()
     .then((katana) => { ninja.katana = katana; })
     .catch((e) => { console.log(e); });
```
