# 属性注入

有时候通过构造器注入不是最理想的注入方式，因此 InversifyJS 支持属性注入。但是，你应该尽可能避免使用属性注入而使用构造器注入。

> 如果一个类不能在缺少依赖的情况下运行，那么把依赖通过构造器传入。创建一个没有完全初始化的类（“两步构造”）是一种反模式（在我看来）。如果这个类可以在缺少依赖的情况下运行，那么通过设置器注入是可接受的。

来源：[http://stackoverflow.com/](http://stackoverflow.com/questions/1503584/dependency-injection-through-constructors-or-property-setters)

有两种情况你也许想使用属性注入。

- 当我们**可以**使用 InversifyJS 来创建类的实例时。
- 当我们**不能**使用 InversifyJS 来创建类的实例时。

这两种情况非常不同并且需要不同的属性注入实现。

## 当我们**可以**使用 InversifyJS 来创建类的实例时

如果你在使用一个允许 InversifyJS 在应用中创建类的实例的库或者框架时，那么你可以用 `@inject` 装饰器注入到属性中：

```ts
import { injectable, inject, container } from "inversify";

@injectable()
class PrintService {
    // ...
}

@injectable()
class Summary {
    // ...
}

@injectable()
class Author {
    // ...
}

@injectable()
class Book {

  private _author: Author;
  private _summary: Summary;

  @inject("PrintService")
  private _printService: PrintService;

  public constructor(
      @inject("Author") author: Author,
      @inject("Summary") summary: Summary
) {
    this._author = author;
    this._summary = summary;
  }

  public print() {
     this._printService.print(this);
  }

}

let container = new Container();
container.bind<PrintService>("PrintService").to(PrintService);
container.bind<Author>("Author").to(Author);
container.bind<Summary>("Summary").to(Summary);
container.bind<Book>("Book").to(Book);

// Book 实例是由 InversifyJS 创建的
let book = container.get<Book>("Book");
book.print();
```

更多示例请参考我们的 [单元测试](https://github.com/Inversify/InversifyJS/blob/master/wiki/property_injection.md)。

## 当我们**不能**使用 InversifyJS 来创建类的实例时

InversifyJS 被设计来和尽可能多的库和框架进行继承。但是，许多它的特性需要能够在应用中创建类的实例。

问题在于有些框架掌握了实例创建大权。比如，React 掌控了给定组件的创建大权。

我们已经开发了一个工具来让你在 InversifyJS 没有创建该实例的情况下注入其属性：

```ts
import getDecorators from "inversify-inject-decorators";
import { Container, injectable  } from "inversify";

@injectable()
class PrintService {
    // ...
}

let container = new Container();
container.bind<PrintService>("PrintService").to(PrintService);
let { lazyInject } = getDecorators(container);

class Book {

  private _author: string;
  private _summary: string;

  @lazyInject("PrintService")
  private _printService: PrintService;

  public constructor(author: string, summary: string) {
    this._author = author;
    this._summary = summary;
  }

  public print() {
     this._printService.print(this);
  }

}

// Book 实例不是由 InversifyJS 创建的
let book = new Book("Title", "Summary");
book.print();
```

这个工具模块被称为 `inversify-inject-decorators` 并且提供了如下的装饰器：

- `@lazyInject` 用来在没有元数据的前提下做属性注入
- `@lazyInjectNamed` 用来在没有名称元数据的情况下做属性注入
- `@lazyInjectTagged` 用来在没有标签元数据的情况下做属性注入
- `@lazyMultiInject` 用来做多重注入

请访问
[该 GitHub 项目](https://github.com/inversify/inversify-inject-decorators) 
了解更多。
