# Property injection
InversifyJS supports property injection because sometimes constructor injection is not the best kind of injection pattern. However, you should try to avoid using property injection and prefer constructor injection in most cases.

> If the class cannot do its job without the dependency, then add it to the constructor. The class needs the new dependency, so you want your change to break things. Also, creating a class that is not fully initialized ("two-step construction") is an anti-pattern (IMHO). If the class can work without the dependency, a setter is fine.

Source: [http://stackoverflow.com/](http://stackoverflow.com/questions/1503584/dependency-injection-through-constructors-or-property-setters)

There are two cases in wich you may want to use property injection.

- When we CAN use InversifyJS to create an instance of a class.
- When we CANNOT use InversifyJS to create an instance of a class.

These cases are quite different an require different implementations of property injection.

## When we CAN use InversifyJS to create an instance of a class

:construction: **[WIP] This feature is under development** :construction:

If you are working with a library or framework that allows InversifyJS
to create instances of the classes in the application, then you can inject into
a property using the `@inject` decorator:

```ts
import { injectable, inject, kernel } from "inversify";

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

let kernel = new Kernel();
kernel.bind<PrintService>("PrintService").to(PrintService);
kernel.bind<Author>("Author").to(Author);
kernel.bind<Summary>("Summary").to(Summary);
kernel.bind<Book>("Book").to(Book);

// Book instance is created by InversifyJS
let book = kernel.get<Book>("Book");
book.print();
```

## When we CANNOT use InversifyJS to create an instance of a class
InversifyJS has been designed in a way that facilitates its integration with as many
libraries and frameworks as possible. However, many of its features requre being able to
create the instances of the classes in an application. 

The problem is that some frameworks take the control over the creation of instances. 
For example, React takes control over the creation of instances of a given Component.

We have developed an utility that allows you to inject into a property even when 
InversifyJS has not created its instances:

```ts
import getDecorators from "inversify-inject-decorators";
import { Kernel, injectable  } from "inversify";

@injectable()
class PrintService {
    // ...
}

let kernel = new Kernel();
kernel.bind<PrintService>("PrintService").to(PrintService);
let { lazyInject } = getDecorators(kernel);

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

// Book instance is NOT created by InversifyJS
let book = new Book("Title", "Summary");
book.print();
```

The utility module is called `inversify-inject-decorators`
and privides the following decorators:

- `@lazyInject` for the injection of a property without metadata
- `@lazyInjectNamed` for the injection of a property without named metadata.
- `@lazyInjectTagged` for the injection of a property without tagged metadata.
- `@lazyMultiInject` for multi-injections.

Please visit the module 
[project on GitHub](https://github.com/inversify/inversify-inject-decorators) 
to learn more.
