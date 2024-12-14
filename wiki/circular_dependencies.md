# Circular dependencies

## Circular dependencies in your modules (ESM, CommonJS)

If you have a circular dependency between two modules and you use the `@inject(SomeClass)` annotation. At runtime, one module will be parsed before the other and the decorator could be invoked with `@inject(SomeClass /* SomeClass = undefined*/)`. InversifyJS will throw the following exception:

> @inject called with undefined this could mean that the class ${name} has a circular dependency problem. You can use a LazyServiceIdentifier to overcome this limitation.

There's a way to overcome this limitation:

- Use a `LazyServiceIdentifier`. The lazy identifier doesn't delay the injection of the dependencies and all dependencies are injected when the class instance is created. However, it does delay the access to the property identifier (solving the module issue). An example of this can be found in [our unit tests](https://github.com/krzkaczor/InversifyJS/blob/a53bf2cbee65803b197998c1df496c3be84731d9/test/inversify.test.ts#L236-L300).

## Circular dependencies in the dependency graph (classes)

InversifyJS is able to identify circular dependencies and will throw an exception to help you to identify the location of the problem if a circular dependency is detected:

```ts
Error: Circular dependency found: Ninja -> A -> B -> C -> D -> A
```


