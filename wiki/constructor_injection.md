# Injecting a class constructor
Binds an abstraction to a class constructor.
```ts
@injectable()
class Ninja implements INinja {

    private _katana: IKatana;
    private _shuriken: IShuriken;

    public constructor(
	    @inject("INewable<IKatana>") Katana: INewable<IKatana>, 
	    @inject("IShuriken") shuriken: IShuriken
	) {
        this._katana = new Katana();
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

```ts
kernel.bind<INewable<IKatana>>("INewable<IKatana>").toConstructor<IKatana>(Katana);
```
