# Strong Container typing

The `Container` can take an optional type argument defining a mapping of service identifiers to types. If defined, this
will add strong type-checking when declaring bindings, and when retrieving them.

For example:

```ts
type IdentifierMap = {
  foo: Foo;
  bar: Bar;
};

const container = new Container<IdentifierMap>;

container.bind('foo').to(Foo); // ok
container.bind('foo').to(Bar); // error

const foo: Foo = container.get('foo') // ok
const bar: Bar = container.get('foo') // error
```
