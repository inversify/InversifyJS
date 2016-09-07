# Controlling the scope of the dependencies

InversifyJS uses transient scope by default but you can also use singleton scope:

```ts
kernel.bind<Shuriken>("Shuriken").to(Shuriken).inTransientScope(); // Default
kernel.bind<Shuriken>("Shuriken").to(Shuriken).inSingletonScope();
```

## About `inSingletonScope`
There are many available kinds of bindings:
```ts
interface BindingToSyntax<T> {
    to(constructor: { new (...args: any[]): T; }): BindingInWhenOnSyntax<T>;
    toSelf(): BindingInWhenOnSyntax<T>;
    toConstantValue(value: T): BindingWhenOnSyntax<T>;
    toDynamicValue(func: (context: Context) => T): BindingWhenOnSyntax<T>;
    toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
    toFactory<T2>(factory: FactoryCreator<T2>): BindingWhenOnSyntax<T>;
    toFunction(func: T): BindingWhenOnSyntax<T>;
    toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
    toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
}
```

In terms of how scope behaves we can group these types of bindings in two main groups:
- Bindings that will inject an `object`
- Bindings that will inject a `function`

### Bindings that will inject a `object`
In this group are included the following types of binding:
```ts
interface BindingToSyntax<T> {
    to(constructor: { new (...args: any[]): T; }): BindingInWhenOnSyntax<T>;
    toSelf(): BindingInWhenOnSyntax<T>;
    toConstantValue(value: T): BindingWhenOnSyntax<T>;
    toDynamicValue(func: (context: Context) => T): BindingInWhenOnSyntax<T>;
}
```
We can select the scope of this types of binding with the exception of the `toConstantValue` which will always be a singleton.

When we invoke `kernel.get` for the first time and we are using `to`, `toSelf` or `toDynamicValue` the InversifyJS kernel will try to generate an object instance or value using a constructor or the dynamic value factory. If the scope has been set to `inSingletonScope` the value is cached. The second time we invoke `kernel.get`, and if `inSingletonScope` has been selected, InversifyJS will try to get the value from the cache.

Note that a class can have some dependencies and a dynamic value can access other types via the current context. These dependencies may or many not be a singleton independently of the selected scope of their parent object in their respective composition tree,

### Bindings that will inject an `function`
In this group are included the following types of binding:
```ts
interface BindingToSyntax<T> {
    toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
    toFactory<T2>(factory: FactoryCreator<T2>): BindingWhenOnSyntax<T>;
    toFunction(func: T): BindingWhenOnSyntax<T>;
    toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
    toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
}
```
We cannot select the scope of this types of binding because the value to be injected (a factory `function`) is always a singleton. However, the factory internal implementation may or may not return a singleton.

For example, the following binding will inject a factory which will always be a singleton.

```ts
kernel.bind<interfaces.Factory<Katana>>("Factory<Katana>")
	  .toAutoFactory<Katana>("Katana");
```

However, the value returned by the factory may or not be a singleton:

```ts
kernel.bind<Katana>("Katana").to(Katana).inTransientScope();
// or
kernel.bind<Katana>("Katana").to(Katana).inSingletonScope();
```
