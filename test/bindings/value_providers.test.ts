import { expect } from "chai";
import { Binding } from "../../src/bindings/binding";
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

    it("Should set binding scope to singleton when initializing", () => {
      const constantValueProvider = new ConstantValueProvider<unknown>();
      const binding = new Binding("","Request");
      constantValueProvider.initialize(binding);
      expect(binding.scope).to.equal("Singleton")
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