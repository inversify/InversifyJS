import { expect } from "chai";
import { Binding } from "../../src/bindings/binding";
import * as Stubs from "../utils/stubs";
import * as sinon from "sinon";
import { NotConfiguredScope } from "../../src/scope/not-configured-scope";
import { NotConfiguredValueProvider } from "../../src/bindings/not-configured-value-provider";

describe("Binding", () => {

  it("Should set its own properties correctly", () => {

    const fooIdentifier = "FooInterface";
    const fooBinding =  new Binding<Stubs.FooInterface>(fooIdentifier);
    expect(fooBinding.serviceIdentifier).eql(fooIdentifier);
    expect(fooBinding.id).to.be.a("number");
  });

  it("Should initialize with NotConfiguredScope", () => {
    const serviceIdentifier:any = {};
    const binding = new Binding(serviceIdentifier);
    const scope = binding.scope as NotConfiguredScope;
    expect(scope).to.be.instanceOf(NotConfiguredScope);
    expect(scope.serviceIdentifier).to.equal(serviceIdentifier);
  });

  it("Should initialize with NotConfiguredValueProvider", () => {
    const serviceIdentifier:any = {};
    const binding = new Binding(serviceIdentifier);
    const valueProvider = binding.valueProvider as NotConfiguredValueProvider;
    expect(valueProvider).to.be.instanceOf(NotConfiguredValueProvider);
    expect(valueProvider.serviceIdentifier).to.equal(serviceIdentifier);
  });


  describe("Binding from clone", () => {
    it("Should be a new instance of Binding", () => {
      const binding = new Binding("");
      const clone = binding.clone();
      expect(binding).not.to.equal(clone);
      expect(clone).to.be.instanceOf(Binding);
    });

    it("Should have same service identifier", () => {
      const sid = Symbol.for("sid");
      const binding = new Binding(sid);
      const clone = binding.clone();
      expect(clone.serviceIdentifier).to.equal(sid);
    })

    it("Should copy across constraint and handlers", () => {
      const binding = new Binding("");
      binding.constraint = () => true;
      binding.onActivation = (activated) => activated;
      binding.onDeactivation = (deactivate) => {
        //
      };
      const clone = binding.clone();
      expect(clone.constraint).to.equal(binding.constraint);
      expect(clone.onActivation).to.equal(binding.onActivation);
      expect(clone.onDeactivation).to.equal(binding.onDeactivation);
    });

    it("Should clone the scope", () => {
      const binding = new Binding("");
      const clonedScope = {} as any;
      sinon.stub(binding.scope,"clone").returns(clonedScope);
      const clone = binding.clone();
      expect(clone.scope).to.equal(clonedScope);
    });

    it("Should clone the value provider", () => {
      const binding = new Binding("");
      const clonedValueProvider:any = {};
      binding.valueProvider = {
        clone(){
          return clonedValueProvider;
        }
      } as any;
      const clone = binding.clone();
      expect(clone.valueProvider).to.equal(clonedValueProvider);
    })
  });

});
