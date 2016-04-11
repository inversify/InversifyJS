# Contextual bindings

We can apply constraint to the context of a binding to fix AMBIGUOUS_MATCH errors when two or more concretions have been bound to the an abstraction:

```ts
kernel.bind<IWeapon>("IWeapon").to(Katana);
kernel.bind<IWeapon>("IWeapon").to(Shuriken);
```

In a contextual constraint we can check for:

- metadata (tagged and named)
- parameter names
- types

Let's take a look to all these options.

#### Tagged bindings
We can use tagged bindings to fix `AMBIGUOUS_MATCH` errors when two or more
concretions have been bound to the an abstraction. Notice how the  constructor
arguments of the `Ninja` class have been annotated using the `@tagged` decorator:
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
        @inject("IWeapon") @tagged("canThrow", false) katana: IWeapon,
        @inject("IWeapon") @tagged("canThrow", true) shuriken: IWeapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

We are binding `Katana` and `Shuriken` to `IWeapon` but a `whenTargetTagged`
constraint is added to avoid `AMBIGUOUS_MATCH` errors:

```ts
kernel.bind<INinja>(ninjaId).to(Ninja);
kernel.bind<IWeapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
kernel.bind<IWeapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);
```

#### Create your own tag decorators

Creating your own decorators is really simple:

```ts
let throwable = tagged("canThrow", true);
let notThrowable = tagged("canThrow", false);

@injectable()
class Ninja implements INinja {
    public katana: IWeapon;
    public shuriken: IWeapon;
    public constructor(
        @inject("IWeapon") @notThrowable katana: IWeapon,
        @inject("IWeapon") @throwable shuriken: IWeapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

#### Named bindings
We can use named bindings to fix `AMBIGUOUS_MATCH` errors when two or more concretions have
been bound to the an abstraction. Notice how the constructor arguments of the `Ninja` class
have been annotated using the `@named` decorator:
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
        @inject("IWeapon") @named("strong")katana: IWeapon,
        @inject("IWeapon") @named("weak") shuriken: IWeapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

We are binding `Katana` and `Shuriken` to `IWeapon` but a `whenTargetNamed` constraint is
added to avoid `AMBIGUOUS_MATCH` errors:

```ts
kernel.bind<INinja>("INinja").to(Ninja);
kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetNamed("strong");
kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetNamed("weak");
```

#### Kernel.getAll<T>(), Kernel.getNamed<T>() & Kernel.getTagged<T>()
The InversifyJS kernel provides some helpers to resolve multi-injections:

```ts
let kernel = new Kernel();
kernel.bind<IWeapon>("IWeapon").to(Katana);
kernel.bind<IWeapon>("IWeapon").to(Shuriken);

let weapons = kernel.getAll<IWeapon[]>("IWeapon");
```

Named bindings:

```ts
let kernel = new Kernel();
kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetNamed("japonese");
kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetNamed("chinese");

let katana = kernel.getNamed<IWeapon>("IWeapon", "japonese");
let shuriken = kernel.getNamed<IWeapon>("IWeapon", "chinese");
```

And tagged bindings:

```ts
let kernel = new Kernel();
kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetTagged("faction", "samurai");
kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetTagged("faction", "ninja");

let katana = kernel.getTagged<IWeapon>("IWeapon", "faction", "samurai");
let shuriken = kernel.getTagged<IWeapon>("IWeapon", "faction", "ninja");
```

#### Contextual bindings & @paramNames
The `@paramName` decorator is used to access the names of the constructor arguments from a
contextual constraint even when the code is compressed. The `constructor(katana, shuriken) { ...`
becomes `constructor(a, b) { ...` after compression but thanks to `@paramName` we can still
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
        @inject("IWeapon") @paramName("katana") katana: IWeapon,
        @inject("IWeapon") @paramName("shuriken") shuriken: IWeapon
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