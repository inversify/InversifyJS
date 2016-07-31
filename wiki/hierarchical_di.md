# Support for hierarchical DI systems
Some applications use a  hierarchical dependency injection (DI) system.
For example, Angular 2.0 applications use its own 
[hierarchical DI system](https://angular.io/docs/ts/latest/guide/hierarchical-dependency-injection.html).

In a hierarchical DI system, a kernel can have a parent kernel and multiple kernels
can be used in one application. The kernels form a hierarchical structure.

When a kernel at the bottom of the hierarchical structure requests a dependency, 
the kernel tries to satisfy that dependency with it's own bindings. If the kernel 
lacks bindings, it passes the request up to its parent kernel. If that kernel can't 
satisfy the request, it passes it along to its parent kernel. The requests keep 
bubbling up until we find an kernel that can handle the request or run out of kernel 
ancestors.

```ts
let weaponIdentifier = "Weapon";

@injectable()
class Katana {}
 
let parentKernel = new Kernel();
parentKernel.bind(weaponIdentifier).to(Katana);
 
let childKernel = new Kernel();
childKernel.parent = parentKernel;

expect(childKernel.get(weaponIdentifier)).to.be.instanceOf(Katana); // true
```

