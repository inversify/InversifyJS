# Post Construct Decorator

It is possible to add a **@postConstruct** decorator for a class method. This decorator 
will run after an object is instantiated and before any activation handlers. This 
is useful in situations when the constructor has been called but the component has not
yet initialized or in cases you want to perform an initialization logic after the constructor call. 

Its some other cases it gives you a contract that guarantees 
that this method will be invoked only once in the lifetime
of the object when used in singleton scope. See the following examples for usage.

The method can be synchronous or asynchronous.


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

Note that you cannot use more than one @postConstruct decorators 
on the same class. It will throw an error.

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

Usage in basic Javascript

```js
inversify.decorate(inversify.postConstruct(), Katana.prototype, "testMethod");
```
