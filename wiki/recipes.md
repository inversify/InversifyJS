# Recipes
This page contains some code snippets that showcase concrete advanced use cases AKA "recipes".

## Injecting dependencies into a function

You need to start by declaring your bindings just like in any other case:
```ts
let TYPES: {
    something: "something",
    somethingElse: "somethingElse"
};

export { TYPES };
```

```ts
let inversify = require("inversify");
import { TYPES } from "./constants/types";

// declare your container
let container = new inversify.Container();
container.bind(TYPES.something).toConstantValue(1);
container.bind(TYPES.somethingElse).toConstantValue(2);

export { container };
```

Continue by declaring the following helper function:

```ts
import { container } from "./inversify.config"

function bindDependencies(func, dependencies) {
    let injections = dependencies.map((dependency) => {
        return container.get(dependency);
    });
    return func.bind(func, ...injections);
}

export { bindDependencies };
```

Declare your function and bind its dependencies to its arguments using the `bindDependencies` helper:

```ts
import { bindDependencies } from "./utils/bindDependencies";
import { TYPES } from "./constants/types";

function testFunc(something, somethingElse) {
  console.log(`Injected! ${something}`);
  console.log(`Injected! ${somethingElse}`);
}

testFunc = bindDependencies(testFunc, [TYPES.something, TYPES.somethingElse]);

export { testFunc };
```

Use your function :smile:

```ts
import { testFunc } from "./x/test_func";

testFunc();

// > Injected! 1
// > Injected! 2
```

## Overriding bindings on unit tests

Sometimes you want to use your binding declarations in your unit test but you need to override some of them. We recommend you to declare your bindings as container modules inside your application:

```ts
let warriors = new ContainerModule((bind: Bind) => {
    bind<Ninja>("Ninja").to(Ninja);
});

let weapons = new ContainerModule((bind: Bind) => {
    bind<Katana>("Katana").to(Katana);
    bind<Shuriken>("Shuriken").to(Shuriken);
});

export { warriors, weapons };
```

You will then be able to create a new container using the bindings from your application:

```ts
import { warriors, weapons} from './shared/container_modules';
import { Container } from "inversify";

describe("something", () => {

  let container: inversify.Container;

  beforeEach(() => {
      container = new Container();
      container.load(warriors, weapons);
  });

  afterEach(() => {
      container = null;
  });

  it("Should...", () => {
      container.unbind(MyService);
      container.bind(MyService).to(MyServiceMock);
      // do something
  });

});
```

As you can see you can then override specific bindings in each test case.
