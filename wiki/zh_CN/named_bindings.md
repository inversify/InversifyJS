# 命名绑定

当有两个或者更多具体实现被绑定到同一个抽象时，我们可以用命名绑定来修复`模糊匹配`的错误。注意 `Ninja` 类的构造器参数是如何被 `@named` 装饰器标记的：

```ts
interface Weapon {}

@injectable()
class Katana implements Weapon {}

@injectable()
class Shuriken implements Weapon {}

interface Ninja {
    katana: Weapon;
    shuriken: Weapon;
}

@injectable()
class Ninja implements Ninja {
    public katana: Weapon;
    public shuriken: Weapon;
    public constructor(
        @inject("Weapon") @named("strong")katana: Weapon,
        @inject("Weapon") @named("weak") shuriken: Weapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

我们将 `Katana` 和 `Shuriken` 都绑定到了 `Weapon` 上，但是通过添加 `whenTargetNamed` 限制避免了 `模糊匹配` 错误：

```ts
container.bind<Ninja>("Ninja").to(Ninja);
container.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("strong");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("weak");
```
