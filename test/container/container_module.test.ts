import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { ContainerModule } from "../../src/container/container_module";
import { Container }  from "../../src/container/container";

describe("ContainerModule", () => {

  it("Should be able to set the registry of a container module", () => {
      let registry = (bind: interfaces.Bind) => { /* do nothing */ };
      let warriors = new ContainerModule(registry);
      expect(warriors.guid.length).eql(36);
      expect(warriors.registry).eql(registry);
  });

  it("Should be able to remove some bindings from within a container module", () => {

      let container = new Container();
      container.bind<string>("A").toConstantValue("1");
      expect(container.get<string>("A")).to.eql("1");

      let warriors = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
        expect(container.get<string>("A")).to.eql("1");
        unbind("A");
        expect(() => { container.get<string>("A"); }).to.throw();
        bind<string>("A").toConstantValue("2");
        expect(container.get<string>("A")).to.eql("2");
        bind<string>("B").toConstantValue("3");
        expect(container.get<string>("B")).to.eql("3");
      });

      container.load(warriors);
      expect(container.get<string>("A")).to.eql("2");
      expect(container.get<string>("B")).to.eql("3");

  });

});
