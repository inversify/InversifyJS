# Circular dependencies

## Circular dependencies in your modules (ES6, CommonJS, etc.)

If you have a circular dependency between two modules and you use the `@inject(SomeClass)` annotation. At runtime, one module will be parsed before the other and the decorator could be invoked with `@inject(SomeClass /* SomeClass = undefined*/)`. InversifyJS will throw the following exception:

> @inject called with undefined this could mean that the class ${name} has a circular dependency problem. You can use a LazyServiceIdentifer to overcome this limitation.

There are two ways to overcome this limitation:

- Use a `LazyServiceIdentifer`. The lazy identifier doesn't delay the injection of the dependencies and all dependencies are injected when the class instance is created. However, it does delay the access to the property identifier (solving the module issue). An example of this can be found in [our unit tests](https://github.com/krzkaczor/InversifyJS/blob/a53bf2cbee65803b197998c1df496c3be84731d9/test/inversify.test.ts#L236-L300).

- Use the `@lazyInject` decorator. This decorator is part of the [`inversify-inject-decorators`](https://github.com/inversify/inversify-inject-decorators) module. The `@lazyInject` decorator delays the injection of the dependencies until they are actually used, this takes place after a class instance has been created.

## Circular dependencies in the dependency graph (classes)

InversifyJS is able to identify circular dependencies and will throw an exception to help you to identify the location of the problem if a circular dependency is detected:

```ts
Error: Circular dependency found: Ninja -> A -> B -> C -> D -> A
```


