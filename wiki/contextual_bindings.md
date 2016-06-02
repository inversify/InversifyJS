# Contextual bindings & @targetName
The `@targetName` decorator is used to access the names of the constructor arguments from a
contextual constraint even when the code is compressed. The `constructor(katana, shuriken) { ...`
becomes `constructor(a, b) { ...` after compression but thanks to `@targetName` we can still
refer to the design-time names `katana` and `shuriken` at runtime.

```ts
interface IWeapon {}

@injectable()
class Katana implements IWeapon {}

@injectable()
class Shuriken implements IWeapon {}

interface INinja {
    katana: IWeapon;
    shuriken: IWeapon;
}

@injectable()
class Ninja implements INinja {
    public katana: IWeapon;
    public shuriken: IWeapon;
    public constructor(
        @inject("IWeapon") @targetName("katana") katana: IWeapon,
        @inject("IWeapon") @targetName("shuriken") shuriken: IWeapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

We are binding `Katana` and `Shuriken` to `IWeapon` but a custom `when` constraint is added to avoid `AMBIGUOUS_MATCH` errors:

```ts
kernel.bind<INinja>(ninjaId).to(Ninja);

kernel.bind<IWeapon>("IWeapon").to(Katana).when((request: IRequest) => {
    return request.target.name.equals("katana");
});

kernel.bind<IWeapon>("IWeapon").to(Shuriken).when((request: IRequest) => {
    return request.target.name.equals("shuriken");
});
```

The target fields implement the `IQueryableString` interface to help you to create your custom constraints:

```ts
interface IQueryableString {
	 startsWith(searchString: string): boolean;
	 endsWith(searchString: string): boolean;
	 contains(searchString: string): boolean;
	 equals(compareString: string): boolean;
	 value(): string;
}
```
We have included some helpers to facilitate the creation of custom constraints:

```ts
import { Kernel, traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint } from "inversify";

let whenParentNamedCanThrowConstraint = (request: IRequest) => {
    return namedConstraint("canThrow")(request.parentRequest);
};

let whenAnyAncestorIsConstraint = (request: IRequest) => {
    return traverseAncerstors(request, typeConstraint(Ninja));
};

let whenAnyAncestorTaggedConstraint = (request: IRequest) => {
    return traverseAncerstors(request, taggedConstraint("canThrow")(true));
};
```

The InversifyJS fluent syntax for bindings includes some already implemented common contextual constraints:

```ts
interface IBindingWhenSyntax<T> {
    when(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T>;
    whenTargetNamed(name: string): IBindingOnSyntax<T>;
    whenTargetTagged(tag: string, value: any): IBindingOnSyntax<T>;
    whenInjectedInto(parent: (Function|string)): IBindingOnSyntax<T>;
    whenParentNamed(name: string): IBindingOnSyntax<T>;
    whenParentTagged(tag: string, value: any): IBindingOnSyntax<T>;
    whenAnyAncestorIs(ancestor: (Function|string)): IBindingOnSyntax<T>;
    whenNoAncestorIs(ancestor: (Function|string)): IBindingOnSyntax<T>;
    whenAnyAncestorNamed(name: string): IBindingOnSyntax<T>;
    whenAnyAncestorTagged(tag: string, value: any): IBindingOnSyntax<T>;
    whenNoAncestorNamed(name: string): IBindingOnSyntax<T>;
    whenNoAncestorTagged(tag: string, value: any): IBindingOnSyntax<T>;
    whenAnyAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T>;
    whenNoAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T>;
}
```
