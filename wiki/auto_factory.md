# Auto factory
Binds an abstraction to a auto-generated Factory.
```ts
@injectable()
class Ninja implements INinja {

    private _katana: IKatana;
    private _shuriken: IShuriken;

    public constructor(
	    @inject("IFactory<IKatana>") katanaFactory: IFactory<IKatana>,
	    @inject("IShuriken") shuriken: IShuriken
    ) {
        this._katana = katanaFactory();
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

```ts
kernel.bind<IFactory<IKatana>>("IFactory<IKatana>")
	  .toAutoFactory<IKatana>("IKatana");
```
