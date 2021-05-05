import { expect } from "chai";
import { Binding } from "../../src/bindings/binding";
import * as Stubs from "../utils/stubs";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import { interfaces } from "../../src/inversify";
import * as sinon from "sinon";

describe("Binding", () => {

  it("Should set its own properties correctly", () => {

    const fooIdentifier = "FooInterface";
    const fooBinding =  new Binding<Stubs.FooInterface>(fooIdentifier);
    expect(fooBinding.serviceIdentifier).eql(fooIdentifier);
    expect(fooBinding.id).to.be.a("number");
  });

  it("Should throw error when provideValue called amd no valueProvider", () => {
    const fooIdentifier = "FooInterface";
    const fooBinding =  new Binding<Stubs.FooInterface>(fooIdentifier);
    expect(()=>fooBinding.provideValue(null as any, [])).to.throw(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${fooIdentifier}`)
  })

  it("Should get the value from the ValueProvider", () => {
    const fooIdentifier = "FooInterface";
    const fooBinding =  new Binding<Stubs.FooInterface>(fooIdentifier);
    const providedFoo: Stubs.FooInterface = {
      name:"provided foo",
      greet(){
        return "from value provider";
      }
    }
    const ctx = {} as any;
    const kidRequests:interfaces.Request[] = [];
    const valueProvider:interfaces.ValueProvider<Stubs.FooInterface,Stubs.FooInterface> = {
      valueFrom:null as any,
      provideValue(context, childRequests){
        if(context !== ctx || childRequests !== kidRequests){
          throw new Error("did not pass through arguments");
        }
        return providedFoo;
      },
      clone(){
        return null as any;
      }
    }
    fooBinding.valueProvider = valueProvider;
    expect(fooBinding.provideValue(ctx, kidRequests) === providedFoo).to.equal(true);
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

    it("Should clone the scope manager", () => {
      const binding = new Binding("");
      const clonedScopeManager = {} as any;
      sinon.stub(binding.scopeManager,"clone").returns(clonedScopeManager);
      const clone = binding.clone();
      expect(clone.scopeManager).to.equal(clonedScopeManager);
    });

    it("Should clone the value provider if set", () => {
      const binding = new Binding("");
      let clone = binding.clone();
      // tslint:disable-next-line: no-unused-expression
      expect(clone.valueProvider).to.be.undefined;

      const clonedValueProvider:any = {};
      binding.valueProvider = {
        clone(){
          return clonedValueProvider;
        }
      } as any;
      clone = binding.clone();
      expect(clone.valueProvider).to.equal(clonedValueProvider);
    })
  });

});
