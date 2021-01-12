# 激活句柄

给一个类型添加一个激活句柄是可能的。激活句柄在依赖被找到后、但是还没有被添加到缓存（如果是单例的话）并注入之前被调用。
这非常有用，因为这样可以让我们的依赖不必关注横切面（比如缓存、日志等）的具体实现。
下面的例子使用了[代理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)截获了某个依赖（`Katana`）的方法（`use`）。

```ts
interface Katana {
  use: () => void;
}

@injectable()
class Katana implements Katana {
  public use() {
    console.log("Used Katana!");
  }
}

interface Ninja {
  katana: Katana;
}

@injectable()
class Ninja implements Ninja {
  public katana: Katana;
  public constructor(@inject("Katana") katana: Katana) {
    this.katana = katana;
  }
}
```

```ts
container.bind<Ninja>("Ninja").to(Ninja);

container
  .bind<Katana>("Katana")
  .to(Katana)
  .onActivation((context, katana) => {
    let handler = {
      apply: function (target, thisArgument, argumentsList) {
        console.log(`Starting: ${new Date().getTime()}`);
        let result = target.apply(thisArgument, argumentsList);
        console.log(`Finished: ${new Date().getTime()}`);
        return result;
      },
    };
    katana.use = new Proxy(katana.use, handler);
    return katana;
  });
```

```ts
let ninja = container.get<Ninja>();
ninja.katana.use();
> Starting: 1457895135761
> Used Katana!
> Finished: 1457895135762
```
