# Object-oriented design
InversifyJS is an IoC container, an IoC container is a tool that helps you 
to write Object-oriented code that is easy to modify and extend over time. 
However, an IoC container can be wrongly used. To use an IoC in a correct 
manner you must follow some basic object-oriented programming principles 
like the [SOLID principles](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)).

This page of the wiki will focus on the Dependency Inversion Principle (one of 
the SOLID principles) and the Composite Reuse Principle.

### The Composite Reuse Principle

> Favor 'object composition' over 'class inheritance'.

Using inheritance is OK but we should use composition instead if possible. 
More than one level of inheritance is probably a [code smell](https://en.wikipedia.org/wiki/Code_smell).

Inheritance is a bad thing because it is the strongest kind of coupling 
between modules. Let's see an example:

```ts
import BaseModel from "someframework";

class DerivedModel extends BaseModel {
    constructor() {
        super();
    }
    public saveOrUpdate() {
        this.doSomething(); // accessing a base class property
        // ...
    }
}

export DerivedModel;

```

The problem with the code snippet above is that the `DerivedModel` is tightly coupled to the `BaseModel` class.
In this case we used the `extends` keyword. This is particularly bad because there is no way to break the 
coupling caused by the class inheritance.

The following example do something similar but it favors 'object composition' over 'class inheritance':

```ts
@injectable()
class DerivedModel {
    public baseModel: BaseModel;
    constructor(@inject("BaseModel") baseModel: BaseModel) {
        this.baseModel = baseModel;
    }
    public saveOrUpdate() {
        this.baseModel.doSomething();
        // ...
    }
}

export DerivedModel;
```

This time we are using composition and because we are using dependency injection and dependency inversion 
the base and derived classes are not coupled anymore.

### The Dependency Inversion Principle

> Depend upon Abstractions. Do not depend upon concretions.

Dependency injection is no more passing the dependencies of a class via its constructor or a setter:

```ts
@injectable()
class Ninja {

    private _katana: Katana;

    constructor(
        katana: Katana
    ) {
        this._katana = katana;
    }

    public fight() { return this._katana.hit(); };

}
```

In this case the Ninja class has a dependency on the Katana class:

```ts
Ninja --> Katana
```

Notice how the arrow that illustrate the dependency goes from left to right.

If we update the ninja class to depend upon an abstraction of the Katana class (the Katana interface):

```ts
@injectable()
class Ninja {

    private _katana: Katana;

    constructor(
        @inject("Katana") katana: Katana
    ) {
        this._katana = katana;
    }

    public fight() { return this._katana.hit(); };

}
```

In this case, both the Ninja class and the Katana class have a dependency on the Katana interface:

```ts
Ninja --> Katana 
Katana --> Katana
```

This can also be represented as:

```ts
Ninja --> Katana <-- Katana
```

Have you notice how one of the arrows is now inverted?
