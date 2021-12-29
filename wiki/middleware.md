# Middleware
InversifyJS performs 3 mandatory operations before resolving a dependency:

- Annotation
- Planning
- Resolution

In some cases there will be some additional operations:

- Activation
- Middleware

If we have configured some Middleware it will be executed at some point before or after the planning, 
resolution and activation phases.

Middleware can be used to implement powerful development tools. This kind of tools will help developers 
to identify problems during the development process.

## Basic middleware

```ts
import { interfaces, Container } from "inversify";

function logger(planAndResolve: interfaces.Next): interfaces.Next {
    return (args: interfaces.NextArgs) => {
        let start = new Date().getTime();
        let result = planAndResolve(args);
        let end = new Date().getTime();
        console.log(`wooooo  ${end - start}`);
        return result;
    };
}

let container = new Container();
container.applyMiddleware(logger);
```

Now that we have declared a middleware we can create a new Container and use its applyMiddleware 
method to apply it:

```ts
interface Ninja {}

@injectable()
class Ninja implements Ninja {}

let container = new Container();
container.bind<Ninja>("Ninja").to(Ninja);

container.applyMiddleware(logger);
```

The logger middleware will log in console the execution time:

```ts
let ninja = container.get<Ninja>("Ninja");

> wooooo  21
```

## Multiple middleware functions

When multiple middleware functions are applied:

```ts
container.applyMiddleware(middleware1, middleware2);
```

The middleware will be invoked from right to left. 
This means that `middleware2` is invoked before `middleware1`.

## Context interceptor

In some cases you may want to intercept the resolution plan. 

The default `contextInterceptor` is passed to the middleware as an property of `args`.

```ts
function middleware1(planAndResolve: interfaces.Next): interfaces.Next<unknown> {
    return (args: interfaces.NextArgs) => {
        // args.nextContextInterceptor
        // ...
    };
}
```

You can extend the default `contextInterceptor` using a function:

```ts
function middleware1(planAndResolve: interfaces.Next<unknown>): interfaces.Next<unknown> {
    return (args: interfaces.NextArgs) => {
        let nextContextInterceptor = args.contextInterceptor;
        args.contextInterceptor = (context: interfaces.Context) => {
            console.log(context);
            return nextContextInterceptor(context);
        };
        return planAndResolve(args);
    };
}
```

## Custom metadata reader

> :warning: Please note that it is not recommended to create your own custom
> metadata reader. We have included this feature to allow library / framework creators
> to have a higher level of customization but the average user should not use a custom
> metadata reader. In general, a custom metadata reader should only be used when
> developing a framework in order to provide users with an annotation APIs
> less explicit than the default annotation API.
>
> If you are developing a framework or library and you create a custom metadata reader,
> Please remember to provide your framework with support for an alternative for all the
> decorators in the default API: `@injectable`, `@inject`, `@multiInject`, `@tagged`,
> `@named`, `@optional`, `@targetName` & `@unmanaged`.

Middleware allows you to intercept a plan and resolve it but you are not allowed to change the way the annotation phase behaves.

There is a second extension point that allows you to decide what kind of annotation
system you would like to use. The default annotation system is powered by decorators and
reflect-metadata:

```ts
@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
        @inject("Katana") katana: Katana,
        @inject("Shuriken") shuriken: Shuriken
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

You can use a custom metadata reader to implement a custom annotation system.

For example, you could implement an annotation system based on static properties:

```ts
class Ninja implements Ninja {

    public static constructorInjections = [
        "Katana", "Shuriken"
    ];

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
        katana: Katana,
        shuriken: Shuriken
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

A custom metadata reader must implement the `interfaces.MetadataReader` interface.

A full example [can be found in our unit tests](https://github.com/inversify/InversifyJS/blob/master/test/features/metadata_reader.test.ts).

Once you have a custom metadata reader you will be ready to apply it:

```ts
let container = new Container();
container.applyCustomMetadataReader(new StaticPropsMetadataReader());
```
