# Create your own tag decorators

Creating your own decorators is really simple:

```ts
let throwable = tagged("canThrow", true);
let notThrowable = tagged("canThrow", false);

@injectable()
class Ninja implements INinja {
    public katana: IWeapon;
    public shuriken: IWeapon;
    public constructor(
        @inject("IWeapon") @notThrowable katana: IWeapon,
        @inject("IWeapon") @throwable shuriken: IWeapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```
