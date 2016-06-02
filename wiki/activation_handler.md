#### Activation handler
It is possible to add an activation handler for a type. The activation handler is invoked after a dependency has been resolved and before it is added to the cache (if singleton) and injected. This is useful to keep our dependencies agnostic of the  implementation of crosscutting concerns like caching or logging. The following example uses a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to intercept one of the methods (`use`) of a dependency (`IKatana`).

```ts
interface IKatana {
    use: () => void;
}

@injectable()
class Katana implements IKatana {
    public use() {
        console.log("Used Katana!");
    }
}

interface INinja {
    katana: IKatana;
}

@injectable()
class Ninja implements INinja {
    public katana: IKatana;
    public constructor(@inject("IKatana") katana: IKatana) {
        this.katana = katana;
    }
}
```

```ts
kernel.bind<INinja>("INinja").to(Ninja);

kernel.bind<IKatana>("IKatana").to(Katana).onActivation((context, katana) => {
    let handler = {
        apply: function(target, thisArgument, argumentsList) {
            console.log(`Starting: ${new Date().getTime()}`);
            let result = target.apply(thisArgument, argumentsList);
            console.log(`Finished: ${new Date().getTime()}`);
            return result;
        }
    };
    katana.use = new Proxy(katana.use, handler);
    return katana;
});
```

```ts
let ninja = kernelget<INinja>();
ninja.katana.use();
> Starting: 1457895135761
> Used Katana!
> Finished: 1457895135762
```
