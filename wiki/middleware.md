# Middleware
InversifyJS performs 3 mandatory operations before resolving a dependency:

- Annotation
- Planning
- Resolution

In some cases there will be some additional operations:

- Activation
- Middleware

If we have configured some Middleware it will be executed at some point before ot after the planning, 
resolution and activation phases.

Middleware can be used to implement powerful development tools. This kind of tools will help developers 
to identify problems during the development process.

## Basic middleware

```ts
import { interfaces, Kernel } from "inversify";

function logger(planAndResolve: interfaces.PlanAndResolve<any>): interfaces.PlanAndResolve<any> {
    return (args: interfaces.PlanAndResolveArgs) => {
        let start = new Date().getTime();
        let result = planAndResolve(args);
        let end = new Date().getTime();
        console.log(end - start);
        return result;
    };
}

let kernel = new Kernel();
kernel.applyMiddleware(logger);
```

Now that we have declared a middleware we can create a new Kernel and use its applyMiddleware 
method to apply it:

```ts
interface Ninja {}

@injectable()
class Ninja implements Ninja {}

let kernel = new Kernel();
kernel.bind<Ninja>("Ninja").to(Ninja);

kernel.applyMiddleware(logger);
```

The logger middleware will log in console the execution time:

```ts
let ninja = kernel.get<Ninja>("Ninja");

> 21
```

## Multiple middleware functions

When multiple middleware functions are applied:

```ts
kernel.applyMiddleware(middleware1, middleware2);
```

The middleware will be invoked from right to left. 
This means that `middleware2` is invoked before `middleware1`.

## Context interceptor

In some cases you may want to intercept the resolution plan. 

The default `contextInterceptor` is passed to the middleware as an property of `args`.

```ts
function middleware1(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
    return (args: PlanAndResolveArgs) => {
        // args.nextContextInterceptor
        // ...
    };
}
```

You can extends the default `contextInterceptor` using a function:

```ts
function middleware1(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
    return (args: PlanAndResolveArgs) => {
        let nextContextInterceptor = args.contextInterceptor;
        args.contextInterceptor = (context: interfaces.Context) => {
            console.log(context);
            return nextContextInterceptor(context);
        };
        return planAndResolve(args);
    };
}
```
