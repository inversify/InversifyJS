# `Symbol` 作为标识
在非常大型的应用程序里，字符串作为类型标识被 InversifyJS 注入，会导致命名冲突。 InversifyJS 支持和推荐使用 [Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol) 而不是字符串字面量。

> Symbol 是一种特殊的、不可变的数据类型，可以作为对象属性的标识符使用。Symbol 对象是一个 symbol 基本数据类型的隐式对象包装器。

```ts
import { Container, injectable, inject } from "inversify";

let Symbols = {
	Ninja : Symbol.for("Ninja"),
	Katana : Symbol.for("Katana"),
	Shuriken : Symbol.for("Shuriken")
};

@injectable()
class Katana implements Katana {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Shuriken implements Shuriken {
    public throw() {
        return "hit!";
    }
}

@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
	    @inject(Symbols.Katana) katana: Katana,
	    @inject(Symbols.Shuriken) shuriken: Shuriken
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}

var container = new Container();
container.bind<Ninja>(Symbols.Ninja).to(Ninja);
container.bind<Katana>(Symbols.Katana).to(Katana);
container.bind<Shuriken>(Symbols.Shuriken).to(Shuriken);
```
