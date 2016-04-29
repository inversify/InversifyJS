# Recipes
This page contains some code snippets that showcase concrete advanced use cases AKA "recipes".

## Injecting dependencies into a function

You need to start by declaring your bindings just like in any other case:
```ts
let TYPES: {
    something: "something",
    somethingElse: "somethingElse"
};

export default TYPES;
```

```ts
let inversify = require("inversify");
import TYPES from "./constants/types";

// declare your kernel
let kernel = new inversify.Kernel();
kernel.bind(TYPES.something).toValue(1);
kernel.bind(TYPES.somethingElse).toValue(2);

export default kernel;
```

Continue by declaring the following helper function:

```ts
import kernel from "./inversify.config"

function bindDependencies(func, dependencies) {
    let injections = dependencies.map((dependency) => {
        return kernel.get(dependency);
    });
    return func.bind(func, ...injections);
}

export default bindDependencies;
```

Declare your function and bind its dependencies to its arguments using the `bindDependencies` helper:

```ts
import bindDependencies from "./utils/bindDependencies";
import TYPES from "./constants/types";

function testFunc(something, somethingElse) {
  console.log(`Injected! ${something}`);
  console.log(`Injected! ${somethingElse}`);
}

testFunc = bindDependencies(testFunc, [TYPES.something, TYPES.somethingElse]);

export default testFunc;
```

Use your function :smile:

```ts
import testFunc from "./x/test_func";

testFunc();

// > Injected! 1
// > Injected! 2
```
