# 创建你自己的标签装饰器

创建你自己的标签装饰器特别简单：

```ts
let throwable = tagged("canThrow", true);
let notThrowable = tagged("canThrow", false);

@injectable()
class Ninja implements Ninja {
    public katana: Weapon;
    public shuriken: Weapon;
    public constructor(
        @inject("Weapon") @notThrowable katana: Weapon,
        @inject("Weapon") @throwable shuriken: Weapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```
