# Circular dependencies
InversifyJS is able to identify circular dependencies and will throw an exception to help you 
to identify the location of the problem if a circular dependency is detected:

```ts
Error: Circular dependency found: Ninja -> A -> B -> C -> D -> A
```
