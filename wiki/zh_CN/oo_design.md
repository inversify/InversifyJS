# 面向对象设计

InversifyJS 是一个 IoC 容器，一个 IoC 容器是一个工具，用来帮助你写出随时间推移容易修改和扩展的面向对象的代码。
但是，一个 IoC 容器可能会被错误地使用。
要用正确的方式来使用 IoC，你必须遵循一些基本的面向对象编程原则，比如：[SOLID 原则](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)).

本页将重点介绍依赖倒置原则（SOLID 原则中的一个）和组合重用原则。

### 组合重用原则

> ‘对象组合’优于‘类继承’。

使用继承是允许的但是应尽可能使用组合。
超过一个层级的继承可能是一个[代码坏味道](https://en.wikipedia.org/wiki/Code_smell)。

继承是一件坏事情，因为它带来了模块间的最强耦合性。让我们来看个例子：

```ts
import BaseModel from "someframework";

class DerivedModel extends BaseModel {
    public constructor() {
        super();
    }
    public saveOrUpdate() {
        this.doSomething(); // accessing a base class property
        // ...
    }
}

export DerivedModel;

```

这段代码片段的问题在于 `DerivedModel` 被紧耦合到了 `BaseModel` 类。
这里我们使用了 `extends` 关键字。
这非常糟糕因为没有办法打破类继承带来的耦合。

下面的示例实现了类似的效果但是应用了‘组合’优于‘继承’原则：

```ts
@injectable()
class DerivedModel {
    public baseModel: BaseModel;
    public constructor(@inject("BaseModel") baseModel: BaseModel) {
        this.baseModel = baseModel;
    }
    public saveOrUpdate() {
        this.baseModel.doSomething();
        // ...
    }
}

export DerivedModel;
```

这次我们使用了组合，并且优于使用了依赖注入和依赖反转，基类和子类不再耦合了。

### 依赖倒置原则

> 要依赖抽象，而不要依赖具体实现。

依赖注入无非是通过构造器或者设置器将依赖传递给类：

```ts
@injectable()
class Ninja {

    private _katana: Katana;

    public constructor(
        katana: Katana
    ) {
        this._katana = katana;
    }

    public fight() { return this._katana.hit(); };

}
```

这个例子中 Ninja 类依赖 Katana 类：

```ts
Ninja --> Katana
```

注意箭头方向表示了依赖是从左到右的。

如果我们更新 Ninja 类来依赖 Katana 类的抽象（即 Katana 接口）：

```ts
@injectable()
class Ninja {

    private _katana: Katana;

    public constructor(
        @inject("Katana") katana: Katana
    ) {
        this._katana = katana;
    }

    public fight() { return this._katana.hit(); };

}
```

在这种情况下，Ninja 类和 Katana 类都依赖于 Katana 接口：

```ts
Ninja --> Katana 
Katana --> Katana
```

这也可以表示为：

```ts
Ninja --> Katana <-- Katana
```

你注意到其中一个箭头反转了吗？
