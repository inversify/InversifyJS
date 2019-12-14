import { expect } from "chai";
import { CIRCULAR_DEPENDENCY } from "../../src/constants/error_msgs";
import {
  Container,
  inject,
  injectable,
  LazyServiceIdentifer
} from "../../src/inversify";

describe("Issue 944", () => {
  it("@inject should works with LazyServiceIdentifer", () => {
    const container = new Container();

    @injectable()
    class ModuleA {
      @inject(new LazyServiceIdentifer(() => ModuleB))
      public b: ModuleB;
    }

    @injectable()
    class ModuleB {}

    container
      .bind(ModuleA)
      .toSelf()
      .inSingletonScope();
    container
      .bind(ModuleB)
      .toSelf()
      .inSingletonScope();

    const ma = container.get(ModuleA);
    const mb = container.get(ModuleB);

    expect(ma.b).to.eq(mb);
  });

  it("should not allow circular dependency with @inject and LazyServiceIdentifer when using class as token", () => {
    const container = new Container();

    @injectable()
    class ModuleA {
      @inject(new LazyServiceIdentifer(() => ModuleB))
      public b: ModuleB;
    }

    @injectable()
    class ModuleB {
      @inject(new LazyServiceIdentifer(() => ModuleA))
      public a: ModuleA;
    }

    container
      .bind(ModuleA)
      .toSelf()
      .inSingletonScope();
    container
      .bind(ModuleB)
      .toSelf()
      .inSingletonScope();

    const msg = `${CIRCULAR_DEPENDENCY} ModuleA --> ModuleB --> ModuleA`;
    expect(() => {
      container.get(ModuleA);
    }).to.throw(msg);
  });

  it("should not allow circular dependency with @inject and LazyServiceIdentifer when using symbol as token", () => {
    const container = new Container();

    const sbA = Symbol("ModuleA");
    const sbB = Symbol("ModuleB");

    @injectable()
    class ModuleA {
      @inject(new LazyServiceIdentifer(() => sbB))
      public b: ModuleB;
    }

    @injectable()
    class ModuleB {
      @inject(new LazyServiceIdentifer(() => sbA))
      public a: ModuleA;
    }

    container
      .bind(sbA)
      .to(ModuleA)
      .inSingletonScope();
    container
      .bind(sbB)
      .to(ModuleB)
      .inSingletonScope();

    const msg = `${CIRCULAR_DEPENDENCY} Symbol(ModuleA) --> Symbol(ModuleB) --> Symbol(ModuleA)`;
    expect(() => {
      container.get(sbA);
    }).to.throw(msg);
  });
});
