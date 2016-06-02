# Kernel snapshots
Declaring kernel snapshots is a feature that helps you to write unit tests with ease:
```ts
///<reference path="../../src/interfaces/interfaces.d.ts" />

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

        kernel.unbind("IKatana");
        kernel.bind<ISomething>("IKatana").toConstantValue(katanaMock);
        let ninja = kernel.get<INinja>("INinja");
        expect(ninja.fight()).eql("hit with mock");

    });
    
    it("Ninja can sneak", () => {

        let shurikenMock = { 
            throw: () => { return "hit with mock"; } 
        };

        kernel.unbind("IShuriken");
        kernel.bind<ISomething>("IShuriken").toConstantValue(shurikenMock);
        let ninja = kernel.get<INinja>("IShuriken");
        expect(ninja.sneak()).eql("hit with mock");

    });

});
```
