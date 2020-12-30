# 上下文绑定和 @targetName
`@targetName` 装饰器用来从上下文限制中访问构造器的参数名称，这在代码被压缩后也能工作。比如压缩后 `constructor(katana, shuriken) { ...` 变成了 `constructor(a, b) { ...`，但是由于有 `@targetName` 所以我们仍然能够在运行时引用设计时的名称，即 `katana` 和 `shuriken`。

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
    public constructor(
        @inject("Weapon") @targetName("katana") katana: Weapon,
        @inject("Weapon") @targetName("shuriken") shuriken: Weapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

我们将 `Katana` 和 `Shuriken` 绑定到了 `Weapon`， 但是通过添加一个自定义的 `when` 限制就可以避免 `AMBIGUOUS_MATCH` 错误：

```ts
container.bind<Ninja>(ninjaId).to(Ninja);

container.bind<Weapon>("Weapon").to(Katana).when((request: interfaces.Request) => {
    return request.target.name.equals("katana");
});

container.bind<Weapon>("Weapon").to(Shuriken).when((request: interfaces.Request) => {
    return request.target.name.equals("shuriken");
});
```

目标域实现了 `IQueryableString` 接口从而可以帮你创建你自己的自定义限制：

```ts
interface QueryableString {
	 startsWith(searchString: string): boolean;
	 endsWith(searchString: string): boolean;
	 contains(searchString: string): boolean;
	 equals(compareString: string): boolean;
	 value(): string;
}
```
一些自带的帮助方法可以用来协助创建自定义的限制：

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

InversifyJS 用来绑定的流利语法中包含了已经实现的常用上下文限制：

```ts
interface BindingWhenSyntax<T> {
    when(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T>;
    whenTargetNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenTargetTagged(tag: string, value: any): interfaces.BindingOnSyntax<T>;
    whenInjectedInto(parent: (Function|string)): interfaces.BindingOnSyntax<T>;
    whenParentNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenParentTagged(tag: string, value: any): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorIs(ancestor: (Function|string)): interfaces.BindingOnSyntax<T>;
    whenNoAncestorIs(ancestor: (Function|string)): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorTagged(tag: string, value: any): interfaces.BindingOnSyntax<T>;
    whenNoAncestorNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenNoAncestorTagged(tag: string, value: any): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T>;
    whenNoAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T>;
}
```
