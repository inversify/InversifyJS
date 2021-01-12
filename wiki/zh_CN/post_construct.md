# 构造器后置装饰器

可以添加一个 **@postContruct** 装饰器到一个类或者方法。这个装饰器将在一个对象被示例化之后，以及在所有激活句柄之前运行。
当构造器已经被调用但是组件还没有初始化或者你想在构造器被调用后执行一个初始化逻辑时非常有用。

另外它给了你一个契约保证这个方法在该对象被用作单例时的生命周期里只会被调用一次。请看下面的使用示例。


```ts
interface Katana {
    use: () => void;
}

@injectable()
class Katana implements Katana {
    constructor() {
        console.log("Katana is born");
    }
    
    public use() {
        return "Used Katana!";
    }
    
    @postConstruct()
    public testMethod() {
        console.log("Used Katana!")
    }
}

```

```ts
container.bind<Katana>("Katana").to(Katana);
```

```ts
let catana = container.get<Katana>();
> Katana is born
> Used Katana!
```

注意你不能在同一个类上使用多个 `@postConstruct` 装饰器，会抛错。

```ts
class Katana {
    @postConstruct()
        public testMethod1() {/* ... */}

    @postConstruct()
        public testMethod2() {/* ... */}
    }
            
Katana.toString();
> Error("Cannot apply @postConstruct decorator multiple times in the same class")
```

在基础 JavaScript 中的用法

```js
inversify.decorate(inversify.postConstruct(), Katana.prototype, "testMethod");
```
