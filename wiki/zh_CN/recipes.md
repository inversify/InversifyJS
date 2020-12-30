# 菜谱

本页包含一些代码片段，能够展示具体的高级用法，即“菜谱”。

## 注入依赖到函数

就像在其他场景下一样，你需要从声明你的绑定关系开始：

```ts
let TYPES: {
    something: "something",
    somethingElse: "somethingElse"
};

export { TYPES };
```

```ts
let inversify = require("inversify");
import { TYPES } from "./constants/types";

// 声明你的容器
let container = new inversify.Container();
container.bind(TYPES.something).toConstantValue(1);
container.bind(TYPES.somethingElse).toConstantValue(2);

export { container };
```

继续声明如下帮助函数：

```ts
import { container } from "./inversify.config"

function bindDependencies(func, dependencies) {
    let injections = dependencies.map((dependency) => {
        return container.get(dependency);
    });
    return func.bind(func, ...injections);
}

export { bindDependencies };
```

使用 `bindDependencies` 帮助函数来声明你的函数并且绑定它的依赖到参数中：

```ts
import { bindDependencies } from "./utils/bindDependencies";
import { TYPES } from "./constants/types";

function testFunc(something, somethingElse) {
  console.log(`Injected! ${something}`);
  console.log(`Injected! ${somethingElse}`);
}

testFunc = bindDependencies(testFunc, [TYPES.something, TYPES.somethingElse]);

export { testFunc };
```

使用你的函数 :smile:

```ts
import { testFunc } from "./x/test_func";

testFunc();

// > Injected! 1
// > Injected! 2
```

## 在单元测试中重载绑定

有时候你希望在单元测试中使用你的绑定声明但是需要重载其中的一些。我们推荐你在应用中将绑定关系声明为一个容器模块：

```ts
let warriors = new ContainerModule((bind: Bind) => {
    bind<Ninja>("Ninja").to(Ninja);
});

let weapons = new ContainerModule((bind: Bind) => {
    bind<Katana>("Katana").to(Katana);
    bind<Shuriken>("Shuriken").to(Shuriken);
});

export { warriors, weapons };
```

然后你就可以使用应用中的绑定关系创建新的容器：

```ts
import { warriors, weapons} from './shared/container_modules';
import { Container } from "inversify";

describe("something", () => {

  let container: inversify.Container;

  beforeEach(() => {
      container = new Container();
      container.load(warriors, weapons);
  });

  afterEach(() => {
      container = null;
  });

  it("Should...", () => {
      container.unbind(MyService);
      container.bind(MyService).to(MyServiceMock);
      // do something
  });

});
```

如你所见，你可以在每个测试用例中重载特定的绑定。

## 当存在循环依赖时使用请求生命周期和激活句柄来避免工厂

如果我们遇到一个循环依赖的场景如下：

- `Warrior` 有一个属性名为 `weapon`，它是一个 `Weapon` 实例。
- `Weapon` 有一个属性名为 `owner`，它是一个 `Warrior` 实例。

我们可以使用工厂来解决这个问题：

```ts
import { inject, injectable, Container, interfaces } from "inversify";
import "reflect-metadata";

type FactoryOfWeapon = (parent: IWeaponHolder) => IWeapon;

const TYPE = {
    OrphanWeapon: Symbol.for("OrphanWeapon"),
    FactoryOfWeapon: Symbol.for("FactoryOfWeapon"),
    WeaponName: Symbol.for("WeaponName"),
    WeaponHolder: Symbol.for("WeaponHolder")
};

interface IWeapon {
    parent: IWeaponHolder;
    use(): string;
    owner(): string;
}

interface IWeaponHolder {
    name: string;
    weapon: IWeapon;
    fight(): string;
}

@injectable()
class Weapon implements IWeapon {
    private readonly _name: string;
    public parent: IWeaponHolder;

    public constructor(
        // We can inject stuff into Weapon
        @inject(TYPE.WeaponName) name: string
    ) {
        this._name = name;
    }

    public use() {
        return this._name;
    }

    public owner() {
        return `Owned by ${this.parent.name}!`;
    }

}

@injectable()
class Character implements IWeaponHolder {
    public weapon: IWeapon;
    public name: string;
    public constructor(
        @inject(TYPE.FactoryOfWeapon) factoryOfWeapon: FactoryOfWeapon
    ) {
        this.name = "Ninja";
        this.weapon = factoryOfWeapon(this);
    }
    public fight() {
        return `Using ${this.weapon.use()}!`;
    }
}

const container = new Container();

// 我们注入一个字符串用来展示能够给 Weapon 注入一些东西
container.bind<string>(TYPE.WeaponName).toConstantValue("Katana");

// 我们为 Weapon 声明一个绑定从而可以在工厂里使用它
container.bind<IWeapon>(TYPE.OrphanWeapon).to(Weapon);

container.bind<FactoryOfWeapon>(TYPE.FactoryOfWeapon).toFactory<IWeapon>(
    (ctx: interfaces.Context) => {
        return (parent: IWeaponHolder) => {
            const orphanWeapon = ctx.container.get<IWeapon>(TYPE.OrphanWeapon);
            orphanWeapon.parent = parent;
            return orphanWeapon;
        };
    });

container.bind<IWeaponHolder>(TYPE.WeaponHolder).to(Character);

const character = container.get<IWeaponHolder>(TYPE.WeaponHolder);
console.log(character.fight());
console.log(character.weapon.owner());
```

但是如果因为某些原因我们真的想避免使用工厂，那么我们可以使用请求生命周期和激活句柄来避免工厂：

```ts
import { inject, injectable, Container, interfaces } from "inversify";
import "reflect-metadata";

type FactoryOfWeapon = (parent: IWeaponHolder) => IWeapon;

const TYPE = {
    WeaponName: Symbol.for("WeaponName"),
    WeaponHolder: Symbol.for("WeaponHolder"),
    Weapon: Symbol.for("Weapon")
};

interface IWeapon {
    parent: IWeaponHolder;
    use(): string;
    owner(): string;
}

interface IWeaponHolder {
    name: string;
    weapon: IWeapon;
    fight(): string;
}

@injectable()
class Weapon implements IWeapon {
    private readonly _name: string;
    public parent: IWeaponHolder;

    public constructor(
        // 我们能够向 Weapon 中注入一些东西
        @inject(TYPE.WeaponName) name: string
    ) {
        this._name = name;
    }

    public use() {
        return this._name;
    }

    public owner() {
        return `Owned by ${this.parent.name}!`;
    }

}

@injectable()
class Character implements IWeaponHolder {
    public weapon: IWeapon;
    public name: string;
    public constructor(
        @inject(TYPE.Weapon) weapon: IWeapon
    ) {
        this.name = "Ninja";
        this.weapon = weapon; // 不需要工厂 :)
    }
    public fight() {
        return `Using ${this.weapon.use()}!`;
    }
}

const container = new Container();

// 我们注入一个字符串用来展示能够给 Weapon 注入一些东西
container.bind<string>(TYPE.WeaponName).toConstantValue("Katana");

// 这里的请求生命周期非常重要
container.bind<IWeapon>(TYPE.Weapon).to(Weapon).inRequestScope();

// 我们能够使用 onActivation 和在 inRequestScope 中搜索 Weapon
container.bind<IWeaponHolder>(TYPE.WeaponHolder)
    .to(Character)
    .onActivation((ctx: interfaces.Context, weaponHolderInstance: IWeaponHolder) => {
        const scope = ctx.plan.rootRequest.requestScope;
        if (scope) {
            // 我们在整个 inRequestScope 中搜索，这将花费 O(n) 执行时间所以比工厂慢
            const weaponInstance = Array.from(scope.values())
                                        .find(v => v instanceof Weapon);
            weaponInstance.parent = weaponHolderInstance;
        }
        return weaponHolderInstance;
    });

const character = container.get<IWeaponHolder>(TYPE.WeaponHolder);

console.log(character.fight()); // Using Katana!
console.log(character.weapon.owner()); // Owned by Ninja!.
```

请注意这个解决方案有点脆弱，并且不是在所有的上下文限制中都有效。`onActivation` 可能需要额外的逻辑来处理更多复杂的场景。
