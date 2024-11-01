# Pre Destroy Decorator

It is possible to add a **@preDestroy** decorator for a class method. This decorator will run before a service is unbinded for any cached instance. For this reason, only bindings in singleton scope can contain a method with this decorator.

```ts
@injectable()
class Destroyable {
    @preDestroy()
    public myPreDestroyMethod() {
        console.log('Destroyable is about to be unbinded!');
    }
}

const container: Container = new Container();
container.bind<Destroyable>("Destroyable").to(Destroyable).inSingletonScope();

container.get("Destroyable");

container.unbindAll();
```
