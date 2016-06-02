# Support for classes
InversifyJS allows your classes to have a direct dependency on other classes. When doing so you will need to use the `@injectable` decorator but you will not be required to use the `@inject` decorator.
```ts
import { Kernel, injectable, inject } from "inversify";

@injectable()
class Katana {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Shuriken {
    public throw() {
        return "hit!";
    }
}

@injectable()
class Ninja implements INinja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(katana: Katana, shuriken: Shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}

var kernel = new Kernel();
kernel.bind<Ninja>(Ninja).to(Ninja);
kernel.bind<Katana>(Katana).to(Katana);
kernel.bind<Shuriken>(Shuriken).to(Shuriken);
```
