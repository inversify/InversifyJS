# Injecting a class constructor

InversifyJS supports constructor injection to allow passing abstractions or instances of concrete classes
during the creation of the injectable object.

In case of abstractions (interfaces) you need to use the @inject decorator. This is required because
the metadata of the abstractions are not available during runtime :

```ts
@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
	    @inject("Newable<Katana>") Katana: interfaces.Newable<Katana>, 
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


In case of concrete injections, you can simply define your constructor parameters as usual without using the @inject decorator.

InversifyJS also supports TypeScript's constructor assignments so you can have private or protected access modifiers in your parameters
and the container will have no trouble injecting the dependencies :

```ts
@injectable()
class Ninja implements Ninja {

    public constructor(private _dagger:Dagger) {

    }

    public throwDagger() {
        this._dagger.throw();
    }

}
```

```ts
container.bind<Dagger>(Dagger).toSelf()
```
