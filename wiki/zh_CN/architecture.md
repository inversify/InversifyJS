# 架构总览

为了给贡献者提供方便特创建此页面。

InversifyJs 的内部架构深受 [Ninject](https://github.com/ninject/Ninject) 影响。深受影响并不意味着这两种架构完全等同。事实上，由于C# 和 JavaScript 是完全不同的编程语言，所以这两种架构也非常不一样。但是，用来描述库的某些元素以及解决方案过程中的阶段的术语却没有太多区别。

# 解决方案过程

InversifyJs 在解决依赖项之前会执行 **3 个强制操作**：

- **标记**
- **计划**
- **中间件（可选）**
- **解决**
- **激活（可选）**

在某些情况下会执行一些 **额外操作（中间件和激活）**。

项目文件夹的架构根据解决过程的相关阶段将组件分组放置：

```
├── src 源代码
│   ├── annotation 标记
│   │   ├── context.ts
│   │   ├── metadata.ts
│   │   ├── queryable_string.ts
│   │   ├── request.ts
│   │   └── target.ts
│   ├── bindings 绑定
│   │   ├── binding.ts
│   │   ├── binding_count.ts
│   │   └── binding_scope.ts
│   ├── constants 常量
│   │   ├── error_msgs.ts
│   │   └── metadata_keys.ts
│   ├── decorators 装饰器
│   │   ├── decorator_utils.ts
│   │   ├── inject.ts
│   │   ├── named.ts
│   │   ├── target_name.ts
│   │   └── tagged.ts
│   ├── interfaces 接口
│   │   └── ...
│   ├── inversify.ts
│   ├── container 容器
│   │   ├── container.ts
│   │   ├── key_value_pair.ts
│   │   ├── lookup.ts
│   │   ├── plan.ts
│   │   ├── planner.ts
│   │   └── resolver.ts
│   └── middleware 中间件
│       └── logger.ts
```

### 标记阶段

标记阶段读取由装饰器生成的元数据，并将其转化成一系列的请求和目标类的实例。这个请求和目标实例随后在计划阶段被用来生成解决方案计划。

### 计划阶段

当我们调用下面的代码时：
```js
var obj = container.get<SomeType>("SomeType");
```
我们就开始了一个新的解决方案，这意味着容器会创建新的解决方案上下文。解决方案上下文包含了指向容器的引用和指向计划的引用。

计划由计划者类的实例生成。计划包含了指向上下文的引用和指向（根）请求的引用。一个请求代表了一个将会被注入到目标的依赖。

让我们来看一下如下的代码片段：

```js
@injectable()
class FooBar implements FooBarInterface {
  public foo : FooInterface;
  public bar : BarInterface;
  public log() {
    console.log("foobar");
  }
  constructor(
    @inject("FooInterface") foo : FooInterface, 
    @inject("BarInterface") bar : BarInterface
  ) {
    this.foo = foo;
    this.bar = bar;
  }
}

var foobar = container.get<FooBarInterface>("FooBarInterface");
```

以上代码片段将会生成一个新的上下文和一个新的计划。计划将会包含一个没有实际目标的根请求以及两个子请求：
- 第一个子请求代表了一个依赖 `FooInterface` 的依赖项，它的目标是构建函数中名字为 `foo` 的参数。
- 第二个自请求代表了一个依赖 `BarInterface` 的依赖想，它的目标是构建函数中名字为 `bar` 的参数。

下面的图能够帮助你理解解决方案上下文的形状以及所有的内部组成间是如何相互依赖的：

![](https://i.imgur.com/NSSbPWy.png)

### 中间件阶段

如果我们已经配置了一些中间件，那么它们将恰好在解决阶段发生前执行。中间件可被用来开发一些浏览器插件，从而允许我们使用诸如 D3.js 这样的可视化工具来展示解决计划。这类工具能够帮助开发者们在开发过程中定位问题。

一个中间件的例子是 [inversify-日志-中间件](https://github.com/inversify/inversify-logger-middleware)，它可以用来在控制台中展示解决计划以及创建和解决所花费的时间：

![](https://i.imgur.com/iFAogro.png)

### 解决阶段

计划被传递给解决者类的一个实例。解决者随后从叶子结点开始直到根请求结束，依次解决请求树中的每一个依赖项。

解决过程可以同步执行，也可以异步执行从而提升性能。

### 激活阶段

激活在依赖项被解决之后发生，就在它被加入到缓存（如果是单例的话）和被注入之前。可以添加一个事件处理器，这个处理器会在激活完成前被调用。这个特性允许开发者做一些事情，比如注入一个代理来截获所有对该对象的属性或者方法的调用。
