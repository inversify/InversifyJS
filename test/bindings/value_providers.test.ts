import { expect } from "chai";
import { ConstantValueProvider } from "../../src/bindings/constant-value-provider"

describe("value providers", () => {
  describe("ConstantValueProvider", () => {
    it("Should provide the constant value", () => {
      class Constant {}
      const constantValueProvider = new ConstantValueProvider<Constant>();
      const constant = new Constant();
      constantValueProvider.valueFrom = constant;
      expect(constantValueProvider.provideValue() === constant).to.equal(true);
    });

    it("Should be able to clone itself", () => {
      class Constant {}
      const constantValueProvider = new ConstantValueProvider<Constant>();
      const constant = new Constant();
      constantValueProvider.valueFrom = constant;
      const cloned = constantValueProvider.clone();
      expect(cloned).to.be.instanceOf(ConstantValueProvider);
      expect(cloned.valueFrom === constant);
    })
  })
})