import { expect } from "chai";
import { Container } from "../../src/container/container";
import { AsyncContainerModule, ContainerModule } from "../../src/container/container_module";
import { interfaces } from "../../src/interfaces/interfaces";

describe("ContainerModule", () => {

  it("Should be able to set the registry of a container module", () => {
      const registry = (bind: interfaces.Bind) => { /* do nothing */ };
      const warriors = new ContainerModule(registry);
      expect(warriors.id).to.be.a("number");
      expect(warriors.registry).eql(registry);
  });

  it("Should be able to remove some bindings from within a container module", () => {

      const container = new Container();
      container.bind<string>("A").toConstantValue("1");
      expect(container.get<string>("A")).to.eql("1");

      const warriors = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
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

  it("Should be able to check for existence of bindings within a container module", () => {

    const container = new Container();
    container.bind<string>("A").toConstantValue("1");
    expect(container.get<string>("A")).to.eql("1");

    const warriors = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound) => {
      expect(container.get<string>("A")).to.eql("1");
      expect(isBound("A")).to.eql(true);
      unbind("A");
      expect(isBound("A")).to.eql(false);
    });

    container.load(warriors);

  });

  it("Should be able to override a binding using rebind within a container module", () => {

    const TYPES = {
        someType: "someType"
    };

    const container = new Container();

    const module1 = new ContainerModule(
      (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound
      ) => {
        bind<number>(TYPES.someType).toConstantValue(1);
        bind<number>(TYPES.someType).toConstantValue(2);
      }
    );

    const module2 = new ContainerModule(
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
    const values1 = container.getAll(TYPES.someType);
    expect(values1[0]).to.eq(1);
    expect(values1[1]).to.eq(2);

    container.load(module2);
    const values2 = container.getAll(TYPES.someType);
    expect(values2[0]).to.eq(3);
    expect(values2[1]).to.eq(undefined);

  });

  it("Should be able use await async functions in container modules", async () => {

    const container = new Container();
    const someAsyncFactory = () => new Promise<number>((res) => setTimeout(() => res(1), 100));
    const A = Symbol.for("A");
    const B = Symbol.for("B");

    const moduleOne = new AsyncContainerModule(async (bind) => {
      const val = await someAsyncFactory();
      bind(A).toConstantValue(val);
    });

    const moduleTwo = new AsyncContainerModule(async (bind) => {
      bind(B).toConstantValue(2);
    });

    await container.loadAsync(moduleOne, moduleTwo);

    const AIsBound = container.isBound(A);
    expect(AIsBound).to.eq(true);
    const a = container.get(A);
    expect(a).to.eq(1);

  });

});
