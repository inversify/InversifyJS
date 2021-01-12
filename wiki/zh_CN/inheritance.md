# 继承

我们尽量为开发者提供有用的错误反馈，比如：

> Error: Missing required @injectable annotation in: SamuraiMaster

这在多数情况下都工作得很好，但是当使用继承时引发了一些问题。

比如，下面的代码片段抛出了误导性的错误：

> The number of constructor arguments in a derived class must be >= than the number of constructor arguments of its base class.

```ts
@injectable()
class Warrior {
  public rank: string;
  public constructor(rank: string) {
    // args count  = 1
    this.rank = rank;
  }
}

@injectable()
class SamuraiMaster extends Warrior {
  public constructor() {
    // args count = 0
    super("master");
  }
}
```

为了克服这个问题，InversifyJS 使用两条规则限制了继承的使用：

> 一个子类必须显式地声明其构造器。

> 子类的构造器参数数量必须大于或等于其基类的构造器参数数量。

你若不遵循这两个规则，那么这个异常将会被抛出：

> Error: The number of constructor arguments in the derived class SamuraiMaster must be >= than the number of constructor arguments of its base class.

用户有几种方式来克服这个限制：

### 解决方法 A) 使用 @unmanaged 装饰器

`@unmanaged()` 装饰器运行用户标记一个参数将会被手动注入到基类。我们使用 “unmanaged” 一词因为 InversifyJS 对用户提供的值没有控制权，就不能管理它们的注入行为。

下面的代码片段展示了如果应用该装饰器：

```ts
import { Container, injectable, unmanaged } from "../src/inversify";

const BaseId = "Base";

@injectable()
class Base {
  public prop: string;
  public constructor(@unmanaged() arg: string) {
    this.prop = arg;
  }
}

@injectable()
class Derived extends Base {
  public constructor() {
    super("unmanaged-injected-value");
  }
}

container.bind<Base>(BaseId).to(Derived);
let derived = container.get<Base>(BaseId);

derived instanceof Derived2; // true
derived.prop; // "unmanaged-injected-value"
```

### 解决方案 B) 属性设置器

你可以使用 `public`、 `protected` 或者 `private` 访问权限标记和一个属性设置器来避免注入到基类中：

```ts
@injectable()
class Warrior {
  protected rank: string;
  public constructor() {
    // args count = 0
    this.rank = null;
  }
}

@injectable()
class SamuraiMaster extends Warrior {
  public constructor() {
    // args count = 0
    super();
    this.rank = "master";
  }
}
```

### 解决饭昂 C) 属性注入

我们也可以使用属性注入来避免注入到基类：

```ts
@injectable()
class Warrior {
  protected rank: string;
  public constructor() {} // args count = 0
}

let TYPES = { Rank: "Rank" };

@injectable()
class SamuraiMaster extends Warrior {
  @injectNamed(TYPES.Rank, "master")
  @named("master")
  protected rank: string;

  public constructor() {
    // args count = 0
    super();
  }
}

container
  .bind<string>(TYPES.Rank)
  .toConstantValue("master")
  .whenTargetNamed("master");
```

### 解决方案 D) 注入到子类

如果我们不想避免注入到基类我们可以注入到子类然后使用基类的构造器（super）注入到基类。

```ts
@injectable()
class Warrior {
  protected rank: string;
  public constructor(rank: string) {
    // args count = 1
    this.rank = rank;
  }
}

let TYPES = { Rank: "Rank" };

@injectable()
class SamuraiMaster extends Warrior {
  public constructor(
    @inject(TYPES.Rank) @named("master") rank: string // args count = 1
  ) {
    super(rank);
  }
}

container
  .bind<string>(TYPES.Rank)
  .toConstantValue("master")
  .whenTargetNamed("master");
```

下面的代码也可行：

```ts
@injectable()
class Warrior {
  protected rank: string;
  public constructor(rank: string) {
    // args count = 1
    this.rank = rank;
  }
}

interface Weapon {
  name: string;
}

@injectable()
class Katana implements Weapon {
  public name: string;
  public constructor() {
    this.name = "Katana";
  }
}

let TYPES = {
  Rank: "Rank",
  Weapon: "Weapon",
};

@injectable()
class SamuraiMaster extends Warrior {
  public weapon: Weapon;
  public constructor(
    @inject(TYPES.Rank) @named("master") rank: string, // args count = 2
    @inject(TYPES.Weapon) weapon: Weapon
  ) {
    super(rank);
    this.weapon = weapon;
  }
}

container.bind<Weapon>(TYPES.Weapon).to(Katana);

container
  .bind<string>(TYPES.Rank)
  .toConstantValue("master")
  .whenTargetNamed("master");
```

## 当我的基类由第三方模块提供时我能做什么？

某些情况下，你也许会碰到错误说一个第三方模块提供的类缺少标记，比如：

> Error: Missing required @injectable annotation in: SamuraiMaster

你可以通过使用 `decorate` 函数来克服这个问题：

```ts
import { decorate, injectable } from "inversify";
import SomeClass from "some-module";

decorate(injectable(), SomeClass);
return SomeClass;
```

在 wiki 中查看 [JS 示例](https://github.com/inversify/InversifyJS/blob/master/wiki/basic_js_example.md) 页面以获取更多信息。
