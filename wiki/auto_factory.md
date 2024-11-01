# Auto factory

Binds an abstraction to an auto-generated Factory.

```ts
@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    constructor(
        @inject("Factory<Katana>") katanaFactory: interfaces.AutoFactory<Katana>,
        @inject("Shuriken") shuriken: Shuriken
    ) {
        this._katana = katanaFactory();
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

```ts
container.bind<Katana>("Katana").to(Katana);

container.bind<interfaces.Factory<Katana>>("Factory<Katana>")
      .toAutoFactory<Katana>("Katana");
```
