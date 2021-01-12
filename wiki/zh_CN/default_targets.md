# whenTargetIsDefault
当一个给定的服务识别器存在多个绑定可用时，我们可以使用如下特性来解决潜在的 `模糊匹配` 异常：

- [命名绑定](named_bindings.md)
- [标签绑定](tagged_bindings.md)
- [上下文绑定](contextual_bindings.md)
- 默认目标

在这一节我们来解释如何使用默认目标：

我们可以使用一个命名限制来解决 `模糊匹配` 异常：

```ts
container.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("strong");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("weak");
```

或者一个标签限制：

```ts
container.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("strong", true);
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("strong", false);
```

这种解决方案的问题是我们不得不在每一次地注入时使用 `@named("strong")`/`@named("weak")` 或者 `@tagged("strong", true)`/`@tagged("strong", false)` 来标记。

更好的方案是使用默认目标：

```ts
container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();
```

当没有 `@named` 或者 `@tagged` 标记可用时，我们可以使用 `whenTargetIsDefault` 来指示哪个绑定应该被用作默认，从而解决 `模糊匹配` 异常。

```ts
let TYPES = {
    Weapon: "Weapon"
};

let TAG = {
    throwable: "throwable"
};

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

@injectable()
class Shuriken implements Weapon {
    public name: string;
    public constructor() {
        this.name = "Shuriken";
    }
}

let container = new Container();
container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();

let defaultWeapon = container.get<Weapon>(TYPES.Weapon);
let throwableWeapon = container.getNamed<Weapon>(TYPES.Weapon, TAG.throwable);

expect(defaultWeapon.name).eql("Katana");
expect(throwableWeapon.name).eql("Shuriken");
```