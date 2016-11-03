# Injecting a class constructor

Binds an abstraction to a class constructor.

```ts
@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
	    @inject("Newable<Katana>") Katana: Newable<Katana>, 
	    @inject("Shuriken") shuriken: Shuriken
	) {
        this._katana = new Katana();
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

```ts
container.bind<interfaces.Newable<Katana>>("Newable<Katana>").toConstructor<Katana>(Katana);
```
