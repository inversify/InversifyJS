# 多重注入

当有两个或者多个具体实现被绑定到同一个抽象时，我们可以使用多重注入。注意 `Weapon` 数组时怎样通过使用 `@multiInject` 装饰器从而由构造器注入到 `Ninja` 类的。

```ts
interface Weapon {
    name: string;
}

@injectable()
class Katana implements Weapon {
    public name = "Katana";
}

@injectable()
class Shuriken implements Weapon {
    public name = "Shuriken";
}

interface Ninja {
    katana: Weapon;
    shuriken: Weapon;
}

@injectable()
class Ninja implements Ninja {
    public katana: Weapon;
    public shuriken: Weapon;
    public constructor(
	    @multiInject("Weapon") weapons: Weapon[]
    ) {
        this.katana = weapons[0];
        this.shuriken = weapons[1];
    }
}
```

我们将 `Katana` 和 `Shuriken` 绑定到了 `Weapon` 中：

```ts
container.bind<Ninja>("Ninja").to(Ninja);
container.bind<Weapon>("Weapon").to(Katana);
container.bind<Weapon>("Weapon").to(Shuriken);
```

## 关于展开 `...` 运算符

在 InversifyJS 的早期发布版本中，展开运算符会失败并且不报错。这是不可接受的，于是我们修复了它，从而允许你使用展开运算符注入数组。但是这并不被推荐，因为实际上没有什么用处。

你可以像下面这样使用 `@multiInject` 和 `...`：

```ts
@injectable()
class Foo {
    public bar: Bar[];
    constructor(@multiInject(BAR) ...args: Bar[][]) {
        // 参数 args 将永远包含唯一一个元素，即 Bar[]
        this.bar = args[0];
    }
}
```

主要的问题是这需要 `args` 的类型为 `Bar[][]`，因为 multiInject 会使用数组包装注入项，而展开运算符也是如此。最终结果就是注入项被数组包裹了两次。

我们尝试解决这个问题但是只有一个办法就是使用 `@spread()` 装饰器生成一些额外的元数据。

```ts
@injectable()
class Foo {
    public bar: Bar[];
    constructor(@multiInject(BAR) @spread() ...args: Bar[]) {
        this.bar = args[0];
    }
}
```

我们放弃了这个想法，因为只有当没有其他办法时再使用装饰器来实现某些事情会更好。在这个情况下明明有一种更加简便的方式达到同样的效果，即**使用 `@multiInject` 并且避免使用 `...`**：

```ts
@injectable()
class Foo {
    public bar: Bar[];
    constructor(@multiInject(BAR) args: Bar[]) {
        this.bar = args;
    }
}
```
