# Container snapshots

Declaring container snapshots is a feature that helps you to write unit tests with ease:

```ts
import { expect } from "chai";
import * as sinon from "sinon";

// application container is shared by all unit tests
import container from "../../src/ioc/container";

describe("Ninja", () => {

    beforeEach(() => {

        // create a snapshot so each unit test can modify 
        // it without breaking other unit tests
        container.snapshot();

    });

    afterEach(() => {

        // Restore to last snapshot so each unit test 
        // takes a clean copy of the application container
        container.restore();

    });
    
    // each test is executed with a snapshot of the container

    it("Ninja can fight", () => {

        let katanaMock = { 
            hit: () => { return "hit with mock"; } 
        };

        container.unbind("Katana");
        container.bind<Something>("Katana").toConstantValue(katanaMock);
        let ninja = container.get<Ninja>("Ninja");
        expect(ninja.fight()).eql("hit with mock");

    });
    
    it("Ninja can sneak", () => {

        let shurikenMock = { 
            throw: () => { return "hit with mock"; } 
        };

        container.unbind("Shuriken");
        container.bind<Something>("Shuriken").toConstantValue(shurikenMock);
        let ninja = container.get<Ninja>("Shuriken");
        expect(ninja.sneak()).eql("hit with mock");

    });

});
```
