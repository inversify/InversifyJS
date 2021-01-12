# 注入一个工厂

绑定一个抽象到用户自定义的工厂。

```ts
@injectable()
class Ninja implements Ninja {
  private _katana: Katana;
  private _shuriken: Shuriken;

  public constructor(
    @inject("Factory<Katana>") katanaFactory: () => Katana,
    @inject("Shuriken") shuriken: Shuriken
  ) {
    this._katana = katanaFactory();
    this._shuriken = shuriken;
  }

  public fight() {
    return this._katana.hit();
  }
  public sneak() {
    return this._shuriken.throw();
  }
}
```

```ts
container
  .bind<interfaces.Factory<Katana>>("Factory<Katana>")
  .toFactory<Katana>((context: interfaces.Context) => {
    return () => {
      return context.container.get<Katana>("Katana");
    };
  });
```

你也可以定义带参数的工厂：

```ts
container
  .bind<interfaces.Factory<Weapon>>("Factory<Weapon>")
  .toFactory<Weapon>((context: interfaces.Context) => {
    return (throwable: boolean) => {
      if (throwable) {
        return context.container.getTagged<Weapon>("Weapon", "throwable", true);
      } else {
        return context.container.getTagged<Weapon>(
          "Weapon",
          "throwable",
          false
        );
      }
    };
  });
```

有时候在不同的运行时你也许需要传递参数给到某工厂：

```ts
container.bind<Engine>("Engine").to(PetrolEngine).whenTargetNamed("petrol");
container.bind<Engine>("Engine").to(DieselEngine).whenTargetNamed("diesel");

container
  .bind<interfaces.Factory<Engine>>("Factory<Engine>")
  .toFactory<Engine>((context) => {
    return (named: string) => (displacement: number) => {
      let engine = context.container.getNamed<Engine>("Engine", named);
      engine.displacement = displacement;
      return engine;
    };
  });

@injectable()
class DieselCarFactory implements CarFactory {
  private _dieselFactory: (displacement: number) => Engine;
  constructor(
    @inject("Factory<Engine>")
    factory: (category: string) => (displacement: number) => Engine // 注入一个引擎工厂
  ) {
    this._dieselFactory = factory("diesel"); // 创建一个 diesel 引擎工厂
  }
  public createEngine(displacement: number): Engine {
    return this._dieselFactory(displacement); // 创建一个具体的 diesel 引擎
  }
}
```
