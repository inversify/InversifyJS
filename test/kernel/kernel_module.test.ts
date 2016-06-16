///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import KernelModule from "../../src/kernel/kernel_module";

describe("KernelModule", () => {

  it("Should throw when invoking get, remove or hasKey with a null key", () => {

      let registry = (bind: IBind) => { /* do nothing */ };

      let warriors = new KernelModule(registry);
      expect(warriors.guid.length).eql(36);
      expect(warriors.registry).eql(registry);

  });

});
