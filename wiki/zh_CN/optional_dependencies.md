# 可选依赖

我们可以用 `@optional()` 装饰器声明一个可选依赖：

```ts
@injectable()
class Katana {
    public name: string;
    public constructor() {
        this.name = "Katana";
    }
}

@injectable()
class Shuriken {
    public name: string;
    public constructor() {
        this.name = "Shuriken";
    }
}

@injectable()
class Ninja {
    public name: string;
    public katana: Katana;
    public shuriken: Shuriken;
    public constructor(
        @inject("Katana") katana: Katana,
        @inject("Shuriken") @optional() shuriken: Shuriken // Optional!
    ) {
        this.name = "Ninja";
        this.katana = katana;
        this.shuriken = shuriken;
    }
}

let container = new Container();

container.bind<Katana>("Katana").to(Katana);
container.bind<Ninja>("Ninja").to(Ninja);

let ninja =  container.get<Ninja>("Ninja");
expect(ninja.name).to.eql("Ninja");
expect(ninja.katana.name).to.eql("Katana");
expect(ninja.shuriken).to.eql(undefined);

container.bind<Shuriken>("Shuriken").to(Shuriken);

ninja =  container.get<Ninja>("Ninja");
expect(ninja.name).to.eql("Ninja");
expect(ninja.katana.name).to.eql("Katana");
expect(ninja.shuriken.name).to.eql("Shuriken");
```

这个例子中我们可以看见第一次我们是如何解决 `Ninja` 的，由于没有相应的为 `Shuriken` 的绑定声明，以及它的属性 `shuriken` 是被 `@optional()` 装饰器标记，因此是未定义的。

在为 `Shuriken` 声明一个绑定后：

```ts
container.bind<Shuriken>("Shuriken").to(Shuriken);
```

所有 `Ninja` 被解决的实例将包含一个 `Shuriken` 的实例。

## 默认值

如果一个依赖被 `@optional()` 装饰器装饰，我们将能够声明一个默认值，就像你可以在任何 TypeScript 应用里能够做的一样：

```ts
@injectable()
class Ninja {
    public name: string;
    public katana: Katana;
    public shuriken: Shuriken;
    public constructor(
        @inject("Katana") katana: Katana,
        @inject("Shuriken") @optional() shuriken: Shuriken = { name: "DefaultShuriken" } // Default value!
    ) {
        this.name = "Ninja";
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```
