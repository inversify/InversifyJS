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
kernel.bind(TYPES.something).toConstantValue(1);
kernel.bind(TYPES.somethingElse).toConstantValue(2);

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

## Overriding bindings on unit tests

Sometimes you want to use your binding declarations in your unit test but you need to override some of them. We recommend you to declare your bindings as kernel modules inside your application:

```ts
let warriors = new KernelModule((bind: Bind) => {
    bind<Ninja>("Ninja").to(Ninja);
});

let weapons = new KernelModule((bind: Bind) => {
    bind<Katana>("Katana").to(Katana);
    bind<Shuriken>("Shuriken").to(Shuriken);
});

export { warriors, weapons };
```

You will then be able to create a new kernel using the bindings from your application:

```ts
import { warriors, weapons} from './shared/kernel_modules';
import { Kernel } from "inversify";

describe("something", () => {

  let kernel: inversify.Kernel;

  beforeEach(() => {
      kernel = new Kernel();
      kernel.load(warriors, weapons);
  });

  afterEach(() => {
      kernel = null;
  });

  it("Should...", () => {
      kernel.unbind(MyService);
      kernel.bind(MyService).to(MyServiceMock);
      // do something
  });

});
```

As you can see you can then override specific bindings in each test case.
