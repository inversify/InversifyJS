# 标签绑定

当我们把两个或者多个具体实现绑定到同一个抽象时，可以使用标签绑定来修复 `模糊匹配` 错误。
注意 `Ninja` 类的构造器参数是如何被 `@tagged` 装饰器标记的：

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
        @inject("Weapon") @tagged("canThrow", false) katana: Weapon,
        @inject("Weapon") @tagged("canThrow", true) shuriken: Weapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```
我们将 `Katana` 和 `Shuriken` 绑定到了 `Weapob`，但是 `whenTargetTagged` 限制避免了 `模糊匹配` 的错误：

```ts
container.bind<Ninja>(ninjaId).to(Ninja);
container.bind<Weapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
container.bind<Weapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);
```
