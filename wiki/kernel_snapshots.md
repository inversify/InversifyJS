# Kernel snapshots

Declaring kernel snapshots is a feature that helps you to write unit tests with ease:

```ts
import { expect } from "chai";
import * as sinon from "sinon";

// application kernel is shared by all unit tests
import kernel from "../../src/ioc/kernel";

describe("Ninja", () => {

    beforeEach(() => {

        // create a snapshot so each unit test can modify 
        // it without breaking other unit tests
        kernel.snapshot();

    });

    afterEach(() => {

        // Restore to last snapshot so each unit test 
        // takes a clean copy of the application kernel
        kernel.restore();

    });
    
    // each test is executed with a snapshot of the kernel

    it("Ninja can fight", () => {

        let katanaMock = { 
            hit: () => { return "hit with mock"; } 
        };

        kernel.unbind("Katana");
        kernel.bind<Something>("Katana").toConstantValue(katanaMock);
        let ninja = kernel.get<Ninja>("Ninja");
        expect(ninja.fight()).eql("hit with mock");

    });
    
    it("Ninja can sneak", () => {

        let shurikenMock = { 
            throw: () => { return "hit with mock"; } 
        };

        kernel.unbind("Shuriken");
        kernel.bind<Something>("Shuriken").toConstantValue(shurikenMock);
        let ninja = kernel.get<Ninja>("Shuriken");
        expect(ninja.sneak()).eql("hit with mock");

    });

});
```
