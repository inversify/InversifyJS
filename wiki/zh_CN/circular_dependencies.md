# 循环依赖

## 在模块中的循环依赖（ES6, CommonJS 等等）

如果在两个模块中存在一个循环依赖，并且使用了 `@inject(SomeClass)` 标记，那么在运行时，某个模块会在其他模块之前被解析，并且装饰器可能会随着 `@inject(SomeClass /* SomeClass = undefined */)` 被调用。这时 InversifyJS 将抛出如下异常：

> @inject 和 undefined 一起被调用了，这可能意味着类 ${name} 存在一个循环依赖问题。你可以用 LazyServiceIdentifer 来克服这个限制。

有两种方式来克服该限制：

- 使用 `LazyServiceIdentifer`。 懒加载识别器并不延迟依赖注入，所有依赖项都在类实例创建时注入。但是，它延迟了对属性识别器的访问（解决了模块问题）。一个相关的例子可从[我们的单元测试](https://github.com/krzkaczor/InversifyJS/blob/a53bf2cbee65803b197998c1df496c3be84731d9/test/inversify.test.ts#L236-L300)中找到。

- 使用 `@lazyInject` 装饰器。该装饰器是 [`inversify-inject-decorators`](https://github.com/inversify/inversify-inject-decorators) 模块的一部分。 `@lazyInject` 装饰器将对依赖项的注入延迟到了真正要使用它们的那一刻，这发生在类实例被创建之后。
## 在依赖关系图中的循环依赖（类间）

InversifyJS 有能力识别循环依赖并且会在检测到循环依赖时抛出相关错误来帮你定位问题：

```ts
错误: 找到了循环依赖：Ninja -> A -> B -> C -> D -> A
```


