#### Support for Symbols
In very large applications using strings as the identifiers of the types to be injected by the InversifyJS can lead to naming collisions. InversifyJS supports and recommends the usage of [Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) instead of string literals.

> A symbol is a unique and immutable data type and may be used as an identifier for object properties. The symbol object is an implicit object wrapper for the symbol primitive data type.

```ts
import { Kernel, injectable, inject } from "inversify";

let Symbols = {
	INinja : Symbol("INinja"),
	IKatana : Symbol("IKatana"),
	IShuriken : Symbol("IShuriken")
};

@injectable()
class Katana implements IKatana {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Shuriken implements IShuriken {
    public throw() {
        return "hit!";
    }
}

@injectable()
class Ninja implements INinja {

    private _katana: IKatana;
    private _shuriken: IShuriken;

    public constructor(
	    @inject(Symbols.IKatana) katana: IKatana,
	    @inject(Symbols.IShuriken) shuriken: IShuriken
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}

var kernel = new Kernel();
kernel.bind<INinja>(Symbols.INinja).to(Ninja);
kernel.bind<IKatana>(Symbols.IKatana).to(Katana);
kernel.bind<IShuriken>(Symbols.IShuriken).to(Shuriken);
```
