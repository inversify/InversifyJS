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

  it("Should be able to check for existance of bindings within a container module", () => {

    let container = new Container();
    container.bind<string>("A").toConstantValue("1");
    expect(container.get<string>("A")).to.eql("1");

    let warriors = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound) => {
      expect(container.get<string>("A")).to.eql("1");
      expect(isBound("A")).to.eql(true);
      unbind("A");
      expect(isBound("A")).to.eql(false);
    });

    container.load(warriors);

  });

  it("Should be able to override a binding using rebind within a container module", () => {

    let TYPES = {
        someType: "someType"
    };

    let container = new Container();

    let module1 = new ContainerModule(
      (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound
      ) => {
        bind<number>(TYPES.someType).toConstantValue(1);
        bind<number>(TYPES.someType).toConstantValue(2);
      }
    );

    let module2 = new ContainerModule(
      (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind
      ) => {
        rebind<number>(TYPES.someType).toConstantValue(3);
      }
    );

    container.load(module1);
    let values1 = container.getAll(TYPES.someType);
    expect(values1[0]).to.eq(1);
    expect(values1[1]).to.eq(2);

    container.load(module2);
    let values2 = container.getAll(TYPES.someType);
    expect(values2[0]).to.eq(3);
    expect(values2[1]).to.eq(undefined);

  });

});
