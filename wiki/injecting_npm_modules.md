# Injecting npm modules

The following example demonstrates how to inject npm modules (`lodash` & `sequelize`) into a class `SomeClass`.

The example directory structure looks as follows:

```
src/
├── entities
│   └── some_class.ts
├── index.ts
└── ioc
    ├── interfaces.ts
    ├── ioc.ts
    └── types.ts
```

### /src/ioc/types.ts

```ts
const TYPES = {
    Sequelize: Symbol.for("Sequelize"),
    Lodash: Symbol.for("Lodash"),
    SomeClass: Symbol.for("SomeClass")
};

export { TYPES };
```

### /src/ioc/interfaces.ts

```ts
import * as sequelize from "sequelize";
import * as _ from "lodash";

export type Sequelize = typeof sequelize;
export type Lodash = typeof _;

export interface SomeClassInterface {
    test(): void;
}

```

### /src/ioc/ioc.ts

```ts
import { Container, ContainerModule } from "inversify";
import * as sequelize from "sequelize";
import * as _ from "lodash";
import { TYPES } from "./types";
import { Sequelize, Lodash } from "./interfaces";
import { SomeClass } from "../entities/some_class";

const thirdPartyDependencies = new ContainerModule((bind) => {
    bind<Sequelize>(TYPES.Sequelize).toConstantValue(sequelize);
    bind<Lodash>(TYPES.Lodash).toConstantValue(_);
    // ..
});

const applicationDependencies = new ContainerModule((bind) => {
    bind<SomeClass>(TYPES.SomeClass).to(SomeClass);
    // ..
});

const container: Container = new Container();

container.load(thirdPartyDependencies, applicationDependencies);

export { container };

```

### /src/entities/some_class.ts

```ts
import { Container, injectable, inject } from "inversify";
import { TYPES } from "../ioc/types";
import { Lodash, Sequelize, SomeClassInterface } from "../ioc/interfaces";

@injectable()
class SomeClass implements SomeClassInterface {

    private _lodash: Lodash;
    private _sequelize: Sequelize;

    constructor(
        @inject(TYPES.Lodash) lodash,
        @inject(TYPES.Sequelize) sequelize,
    ) {
        this._sequelize = sequelize;
        this._lodash = lodash;
    }

    public test() {
        const sequelizeWasInjected = typeof this._sequelize.BIGINT === "function";
        const lodashWasInjected = this._lodash.cloneDeep === "function";
        console.log(sequelizeWasInjected); // true
        console.log(lodashWasInjected); // true
    }

}

export { SomeClass };
```

### /src/index.ts

```ts
import { container } from "./ioc/ioc";
import { SomeClassInterface } from "./ioc/interfaces";
import { TYPES } from "./ioc/types";

const someClassInstance = container.get<SomeClassInterface>(TYPES.SomeClass);
someClassInstance.test();
```

### /package.json

```js
{
  "name": "test",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "inversify": "^4.1.0",
    "lodash": "^4.17.4",
    "reflect-metadata": "~0.2.2",
    "sequelize": "^3.30.4"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.63",
    "@types/sequelize": "^4.0.51"
  }
}
```

### /tsconfig.json

```js
{
    "compilerOptions": {
        "target": "es5",
        "lib": ["es6", "dom"],
        "module": "commonjs",
        "moduleResolution": "node",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```
