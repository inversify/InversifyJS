# Controlling the scope of the dependencies

InversifyJS uses transient scope by default but you can also use singleton and request scope:

```ts
container.bind<Shuriken>("Shuriken").to(Shuriken).inTransientScope(); // Default
container.bind<Shuriken>("Shuriken").to(Shuriken).inSingletonScope();
container.bind<Shuriken>("Shuriken").to(Shuriken).inRequestScope();
```

## About `inSingletonScope`

There are many available kinds of bindings:

```ts
interface BindingToSyntax<T> {
    to(constructor: { new (...args: unknown[]): T; }): BindingInWhenOnSyntax<T>;
    toSelf(): BindingInWhenOnSyntax<T>;
    toConstantValue(value: T): BindingWhenOnSyntax<T>;
    toDynamicValue(func: (context: Context) => T): BindingWhenOnSyntax<T>;
    toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
    toFactory<T2, T3 extends unknown[] = unknown[], T4 extends unknown[] = unknown[]>(
      factory: FactoryCreator<T2, T3, T4>): BindingWhenOnSyntax<T>;
    toFunction(func: T): BindingWhenOnSyntax<T>;
    toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
    toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
}
```

In terms of how scope behaves we can group these types of bindings in two main groups:

- Bindings that will inject an `object`
- Bindings that will inject a `function`

Last but not least, those bindings can inject a value or a promise to a value. There are some caveats regarding the injection of a promise to a value:

- Bindings that will inject a `Promise`

### Bindings that will inject an `object`

In this group are included the following types of binding:

```ts
interface BindingToSyntax<T> {
    to(constructor: { new (...args: unknown[]): T; }): BindingInWhenOnSyntax<T>;
    toSelf(): BindingInWhenOnSyntax<T>;
    toConstantValue(value: T): BindingWhenOnSyntax<T>;
    toDynamicValue(func: (context: Context) => T): BindingInWhenOnSyntax<T>;
}
```

The `inTransientScope` is used by default and we can select the scope of this types of binding, except for `toConstantValue` which will always use `inSingletonScope`.

When we invoke `container.get` for the first time and we are using `to`, `toSelf` or `toDynamicValue` the InversifyJS container will try to generate an object instance or value using a constructor or the dynamic value factory. If the scope has been set to `inSingletonScope` the value is cached. The second time we invoke `container.get` for the same resource ID, and if `inSingletonScope` has been selected, InversifyJS will try to get the value from the cache.

Note that a class can have some dependencies and a dynamic value can access other types via the current context. These dependencies may or may not be a singleton independently of the selected scope of their parent object in their respective composition tree,

### Bindings that will inject a `function`

In this group are included the following types of binding:

```ts
interface BindingToSyntax<T> {
    toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
    toFactory<T2, T3 extends unknown[] = unknown[], T4 extends unknown[] = unknown[]>(
      factory: FactoryCreator<T2, T3, T4>): BindingWhenOnSyntax<T>;
    toFunction(func: T): BindingWhenOnSyntax<T>;
    toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
    toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
}
```

We cannot select the scope of this types of binding because the value to be injected (a factory `function`) is always a singleton. However, the factory internal implementation may or may not return a singleton.

For example, the following binding will inject a factory which will always be a singleton.

```ts
container.bind<interfaces.Factory<Katana>>("Factory<Katana>").toAutoFactory<Katana>("Katana");
```

However, the value returned by the factory may or may not be a singleton:

```ts
container.bind<Katana>("Katana").to(Katana).inTransientScope();
// or
container.bind<Katana>("Katana").to(Katana).inSingletonScope();
```

### Bindings that will inject a `Promise`

- When injecting a promise to a value, the container firstly caches the promise itself the first time a user tries to get the service. Once the promise is fulfilled, the container caches the resolved value instead in order to allow users to get the service syncronously.

## About `inRequestScope`

When we use inRequestScope we are using a special kind of singleton.

- The `inSingletonScope` creates a singleton that will last for the entire life cycle of a type binding. This means that the `inSingletonScope` can be cleared up from memory when we unbind a type binding using `container.unbind`.

- The `inRequestScope` creates a singleton that will last for the entire life cycle of one call to the `container.get`, `container.getTagged` or `container.getNamed` methods. Each call to one of this methods will resolve a root dependency and all its sub-dependencies. Internally, a dependency graph known as the "resolution plan" is created by InversifyJS. The `inRequestScope` scope will use one single instance for objects that appear multiple times in the resolution plan. This reduces the number of required resolutions and it can be used as a performance optimization in some cases.
