import { expect } from "chai";
import { Container, inject, injectable } from "../../src/inversify";

describe("Issue 1570", () => {
  it("It should not return injected value as undefined if the value contains a .then property but it is not a promise", () => {
    const container = new Container();

    interface Injected {
      myProperty: string;
      then: () => number;
    }

    @injectable()
    class ResolveMe {
      constructor(@inject("Injected") public injected: Injected) {}
    }

    container.bind("Injected").toConstantValue({
      myProperty: "myNewProperty",
      then: () => 1
    });

    const me = container.resolve(ResolveMe);
    expect(me.injected.myProperty).to.eql("myNewProperty");
  });
});
