# Support for hierarchical DI systems
Some applications use a  hierarchical dependency injection (DI) system.
For example, Angular 2.0 applications use its own 
[hierarchical DI system](https://angular.io/docs/ts/latest/guide/hierarchical-dependency-injection.html).

In a hierarchical DI system, a container can have a parent container and multiple containers
can be used in one application. The containers form a hierarchical structure.

When a container at the bottom of the hierarchical structure requests a dependency, 
the container tries to satisfy that dependency with it's own bindings. If the container 
lacks bindings, it passes the request up to its parent container. If that container can't 
satisfy the request, it passes it along to its parent container. The requests keep 
bubbling up until we find an container that can handle the request or run out of container 
ancestors.

```ts
let weaponIdentifier = "Weapon";

@injectable()
class Katana {}
 
let parentContainer = new Container();
parentContainer.bind(weaponIdentifier).to(Katana);
 
let childContainer = new Container();
childContainer.parent = parentContainer;

expect(childContainer.get(weaponIdentifier)).to.be.instanceOf(Katana); // true
```

