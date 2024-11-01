# Deactivation handler

It is possible to add a deactivation handler for a type binded in singleton scope.  The handler can be synchronous or asynchronous. The deactivation handler is invoked before the type is unbinded from the container:

```ts
@injectable()
class Destroyable {
}

const container: Container = new Container();
container.bind<Destroyable>("Destroyable").toDynamicValue(() => Promise.resolve(new Destroyable())).inSingletonScope()
    .onDeactivation((destroyable: Destroyable) => {
        console.log("Destroyable service is about to be unbinded");
    });

await container.get("Destroyable");

await container.unbind("Destroyable");
```

It's possible to add a deactivation handler in multiple ways

- Adding the handler to the container.
- Adding the handler to a binding.
- Adding the handler to the class through the [preDestroy decorator](./pre_destroy.md).

Handlers added to the container are the first ones to be resolved. Any handler added to a child container is called before the ones added to their parent. Relevant bindings from the container are called next and finally the `preDestroy` method is called. In the example above, relevant bindings are those bindings bound to the unbinded "Destroyable" service identifier.

The example below demonstrates call order.

```ts
let roll = 1;
let binding = null;
let klass = null;
let parent = null;
let child = null;

@injectable()
class Destroyable {
    @preDestroy()
    public myPreDestroyMethod() {
        return new Promise((presolve) => {
            klass = roll;
            roll += 1;
            presolve({});
        });
    }
}

const container: Container = new Container();
container.onDeactivation("Destroyable", () => {
    return new Promise((presolve) => {
        parent = roll;
        roll += 1;
        presolve();
    });
});

const childContainer = container.createChild();
childContainer.bind<Destroyable>("Destroyable").to(Destroyable).inSingletonScope().onDeactivation(() => new Promise((presolve) => {
    binding = roll;
    roll += 1;
    presolve();
}));
childContainer.onDeactivation("Destroyable", () => {
    return new Promise((presolve) => {
        child = roll;
        roll += 1;
        presolve();
    });
});

childContainer.get("Destroyable");
await childContainer.unbindAsync("Destroyable");

expect(roll).eql(5);
expect(child).eql(1);
expect(parent).eql(2);
expect(binding).eql(3);
expect(klass).eql(4);
```
