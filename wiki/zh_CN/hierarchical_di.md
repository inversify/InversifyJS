# 对层次化依赖倒置系统的支持

一些应用使用了层次化的依赖倒置系统。比如，Angular 2.0 应用使用了自己的
[层次化依赖导致系统](https://angular.io/docs/ts/latest/guide/hierarchical-dependency-injection.html)。

在层次化依赖倒置系统中，容器可以有父容器，并且一个应用中可以有多个容器。这些容器形成了层次化的结构。

当一个处于层次结构中最底层的容器请求一个依赖项时，容器尝试在其自身内部的绑定中查找。如果缺少相关绑定，它向上传递请求到父容器。若父容器查找不到相关绑定则再次向上传递请求。请求被向上冒泡传递直到有个容器能够处理这个请求为止或者贯穿整个祖先容器链。

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

