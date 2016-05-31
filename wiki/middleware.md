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
function logger(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
    return (args: PlanAndResolveArgs) => {
        let start = new Date().getTime();
        let result = planAndResolve(args);
        let end = new Date().getTime();
        console.log(end-start);
        return result;
    };
}

kernel.applyMiddleware(logger);
```

Now that we have declared a middleware we can create a new Kernel and use its applyMiddleware 
method to apply it:

```ts
interface INinja {}

@injectable()
class Ninja implements INinja {}

let kernel = new Kernel();
kernel.bind<INinja>("INinja").to(Ninja);

kernel.applyMiddleware(logger);
```

The logger middleware will log in console the execution time:

```ts
let ninja = kernel.get<INinja>("INinja");

> 21
```

## Multiple middleware
When multiple middleware functions are applied:
```ts
kernel.applyMiddleware(middleware1, middleware2);
```
The middleware will be invoked from right to leaft. 
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
        args.contextInterceptor = (context: IContext) => {
            console.log(context);
            return nextContextInterceptor(context);
        };
        return planAndResolve(args);
    };
}
```
