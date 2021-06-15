# Support for classes
InversifyJS allows your classes to have a direct dependency on other classes. When doing so you will need to use the `@injectable` decorator but you will not be required to use the `@inject` decorator. 

The `@inject` decorator is not required when you use classes. The annotation is not required because the typescript compiler generates the metadata for us. However, this won't happen if you forget one of the following things:

- Import `reflect-metadata`
- Set `emitDecoratorMetadata` to `true` in `tsconfig.json`.

```ts
import { Container, injectable, inject } from "inversify";

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
class Ninja implements Warrior {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(katana: Katana, shuriken: Shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}

var container = new Container();
container.bind<Ninja>(Ninja).to(Ninja);
container.bind<Katana>(Katana).to(Katana);
container.bind<Shuriken>(Shuriken).to(Shuriken);
```

# Self-binding of concrete types
If the type you’re resolving is a concrete type the registration of a binding can feel a repetitive and verbose:

```ts
container.bind<Samurai>(Samurai).to(Samurai);
```

A better solution is to use the `toSelf` method:

```ts
container.bind<Samurai>(Samurai).toSelf();
```

# Known Limitation: Classes as identifiers and circular dependencies

An exception:

> Error: Missing required @Inject or @multiinject annotation in: argument 0 in class Dom.

Will be thrown if we use classes as identifiers in circular dependencies. For example:

```ts
import "reflect-metadata";
import { Container, injectable } from "inversify";
import getDecorators from "inversify-inject-decorators";

let container = new Container();
let { lazyInject } = getDecorators(container);

@injectable()
class Dom {
    public domUi: DomUi;
    constructor (domUi: DomUi) {
        this.domUi = domUi;
    }
}

@injectable()
class DomUi {
    @lazyInject(Dom) public dom: Dom;
}

@injectable()
class Test {
    constructor(dom: Dom) {
        console.log(dom);
    }
}

container.bind<Dom>(Dom).toSelf().inSingletonScope();
container.bind<DomUi>(DomUi).toSelf().inSingletonScope();
const dom = container.resolve(Test); // Error!
```

This error may seem a bit misleading because when using classes as service identifiers `@inject` annotations should not be required and if we do add an annotation like `@inject(Dom)` or `@inject(DomUi)` we will still get the same exception.  This happens because, at the point in time in which the decorator is invoked, the class has not been declared so the decorator is invoked as `@inject(undefined)`. This trigger InversifyJS to think that the annotation was never added. 

The solution is to use symbols like `Symbol.for("Dom")` as service identifiers instead of the classes like `Dom`:

```ts
import "reflect-metadata";
import { Container, injectable, inject } from "inversify";
import getDecorators from "inversify-inject-decorators";

const container = new Container();
const { lazyInject } = getDecorators(container);

const TYPE = {
    Dom: Symbol.for("Dom"),
    DomUi: Symbol.for("DomUi")
};

@injectable()
class DomUi {
    public dom: Dom;
    public name: string;
    constructor (
        @inject(TYPE.Dom) dom: Dom
    ) {
        this.dom = dom;
        this.name = "DomUi";
    }
}

@injectable()
class Dom {
    public name: string;
    @lazyInject(TYPE.DomUi) public domUi: DomUi;
    public constructor() {
        this.name = "Dom";
    }
}

@injectable()
class Test {
    public dom: Dom;
    constructor(
        @inject(TYPE.Dom) dom: Dom
    ) {
        this.dom = dom;
    }
}

container.bind<Dom>(TYPE.Dom).to(Dom).inSingletonScope();
container.bind<DomUi>(TYPE.DomUi).to(DomUi).inSingletonScope();

const test = container.resolve(Test); // Works!
```

