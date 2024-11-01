# Contextual bindings & @targetName
The `@targetName` decorator is used to access the names of the constructor arguments from a
contextual constraint even when the code is compressed. The `constructor(katana, shuriken) { ...`
becomes `constructor(a, b) { ...` after compression but thanks to `@targetName` we can still
refer to the design-time names `katana` and `shuriken` at runtime.

```ts
interface Weapon {}

@injectable()
class Katana implements Weapon {}

@injectable()
class Shuriken implements Weapon {}

interface Ninja {
    katana: Weapon;
    shuriken: Weapon;
}

@injectable()
class Ninja implements Ninja {
    public katana: Weapon;
    public shuriken: Weapon;
    constructor(
        @inject("Weapon") @targetName("katana") katana: Weapon,
        @inject("Weapon") @targetName("shuriken") shuriken: Weapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

We are binding `Katana` and `Shuriken` to `Weapon` but a custom `when` constraint is added to avoid `AMBIGUOUS_MATCH` errors:

```ts
container.bind<Ninja>(ninjaId).to(Ninja);

container.bind<Weapon>("Weapon").to(Katana).when((request: interfaces.Request) => {
    return request.target.name.equals("katana");
});

container.bind<Weapon>("Weapon").to(Shuriken).when((request: interfaces.Request) => {
    return request.target.name.equals("shuriken");
});
```

The target fields implement the `IQueryableString` interface to help you to create your custom constraints:

```ts
interface QueryableString {
    startsWith(searchString: string): boolean;
    endsWith(searchString: string): boolean;
    contains(searchString: string): boolean;
    equals(compareString: string): boolean;
    value(): string;
}
```
We have included some helpers to facilitate the creation of custom constraints:

```ts
import { Container, traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint } from "inversify";

let whenParentNamedCanThrowConstraint = (request: interfaces.Request) => {
    return namedConstraint("canThrow")(request.parentRequest);
};

let whenAnyAncestorIsConstraint = (request: interfaces.Request) => {
    return traverseAncerstors(request, typeConstraint(Ninja));
};

let whenAnyAncestorTaggedConstraint = (request: interfaces.Request) => {
    return traverseAncerstors(request, taggedConstraint("canThrow")(true));
};
```

The InversifyJS fluent syntax for bindings includes some already implemented common contextual constraints:

```ts
interface BindingWhenSyntax<T> {
    when(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T>;
    whenTargetNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenTargetTagged(tag: string, value: unknown): interfaces.BindingOnSyntax<T>;
    whenInjectedInto(parent: (NewableFunction|string)): interfaces.BindingOnSyntax<T>;
    whenParentNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenParentTagged(tag: string, value: unknown): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorIs(ancestor: (NewableFunction|string)): interfaces.BindingOnSyntax<T>;
    whenNoAncestorIs(ancestor: (NewableFunction|string)): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorTagged(tag: string, value: unknown): interfaces.BindingOnSyntax<T>;
    whenNoAncestorNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenNoAncestorTagged(tag: string, value: unknown): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T>;
    whenNoAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T>;
}
```
