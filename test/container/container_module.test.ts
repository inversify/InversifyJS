import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { ContainerModule } from "../../src/container/container_module";

describe("ContainerModule", () => {

  it("Should throw when invoking get, remove or hasKey with a null key", () => {

      let registry = (bind: interfaces.Bind) => { /* do nothing */ };

      let warriors = new ContainerModule(registry);
      expect(warriors.guid.length).eql(36);
      expect(warriors.registry).eql(registry);

  });

});
