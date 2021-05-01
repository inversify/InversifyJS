# Activation handler

It is possible to add an activation handler for a type. The activation handler is invoked after a dependency has been resolved and before it is added to a cache (if singleton or request singleton - [see scope](https://github.com/inversify/InversifyJS/blob/master/wiki/scope.md)) and injected. The activation handler will not be invoked if the dependency is taken from a cache.  The activation handler can be synchronous or asynchronous.

Activation handlers are useful to keep our dependencies agnostic of the implementation of crosscutting concerns like caching or logging. 

The following example uses a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to intercept one of the methods (`use`) of a dependency (`Katana`).

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

container.bind<Katana>("Katana").to(Katana).onActivation((context, katana) => {
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
let ninja = container.get<Ninja>();
ninja.katana.use();
> Starting: 1457895135761
> Used Katana!
> Finished: 1457895135762
```

There are multiple ways to provide an activation handler

- Adding the handler to the container
- Adding the handler to the binding

When multiple activation handlers are binded to a service identifier, the binding handler is called before any others. Then the container handlers are called, starting at the root container and descending the descendant containers stopping at the container with the binding.
