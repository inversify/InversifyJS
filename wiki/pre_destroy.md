# Pre Destroy Decorator

It is possible to add a **@preDestroy** decorator for a class method. This decorator will run before a service is unbinded for any cached instance. For this reason, classes related to bindings on transient scope can not contain a method with this decorator sice there is no way to know which instances should be affected.

```ts
@injectable()
class Destroyable {
    @preDestroy()
    public myPreDestroyMethod() {
        console.log('Destroyable is about to be unbinded!');
    }
}

const container = new Container();
container.bind<Destroyable>("Destroyable").to(Destroyable).inSingletonScope();

container.get("Destroyable");

container.unbindAll();
```
