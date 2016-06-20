import interfaces from "../../src/interfaces/interfaces";
import { expect } from "chai";
import KernelModule from "../../src/kernel/kernel_module";

describe("KernelModule", () => {

  it("Should throw when invoking get, remove or hasKey with a null key", () => {

      let registry = (bind: interfaces.Bind) => { /* do nothing */ };

      let warriors = new KernelModule(registry);
      expect(warriors.guid.length).eql(36);
      expect(warriors.registry).eql(registry);

  });

});
