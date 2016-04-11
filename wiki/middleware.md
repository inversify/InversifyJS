# Middleware
InversifyJS performs 3 mandatory operations before resolving a dependency:

- Annotation
- Planning
- Middleware (optional)
- Resolution
- Activation (optional)

In some cases there will be some additional operations (middleware & activation).

If we have configured some Middleware it will be executed just before the resolution phase takes place.

Middleware can be used to implement powerful development tools. This kind of tools will help developers to identify problems during the development process.

```ts
function logger(next: (context: IContext) => any) {
    return (context: IContext) => {
        let result = next(context);
        console.log("CONTEXT: ", context);
        console.log("RESULT: ", result);
        return result;
    };
};
```

Now that we have declared a middleware we can create a new Kernel and use its applyMiddleware method to apply it:

```ts
interface INinja {}

@injectable()
class Ninja implements INinja {}

let kernel = new Kernel();
kernel.bind<INinja>("INinja").to(Ninja);

kernel.applyMiddleware(logger);
```

The logger middleware will log in console the context and result:

```ts
let ninja = kernel.get<INinja>("INinja");

> CONTEXT:  Context {
  kernel: 
   Kernel {
     _planner: Planner {},
     _resolver: Resolver {},
     _bindingDictionary: Lookup { _dictionary: [Object] },
     _middleware: [Function] },
  plan: 
   Plan {
     parentContext: [Circular],
     rootRequest: 
      Request {
        serviceIdentifier: 'INinja',
        parentContext: [Circular],
        parentRequest: null,
        target: null,
        childRequests: [],
        bindings: [Object] } } }
> RESULT:  Ninja {}
```