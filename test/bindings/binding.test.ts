import { expect } from "chai";
import { Binding } from "../../src/bindings/binding";
import { BindingScopeEnum } from "../../src/constants/literal_types";
import * as Stubs from "../utils/stubs";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import { interfaces } from "../../src/inversify";

describe("Binding", () => {

  it("Should set its own properties correctly", () => {

    const fooIdentifier = "FooInterface";
    const fooBinding =  new Binding<Stubs.FooInterface>(fooIdentifier, BindingScopeEnum.Transient);
    expect(fooBinding.serviceIdentifier).eql(fooIdentifier);
    expect(fooBinding.implementationType).eql(null);
    expect(fooBinding.cache).eql(null);
    expect(fooBinding.scope).eql(BindingScopeEnum.Transient);
    expect(fooBinding.id).to.be.a("number");
  });

  it("Should throw error when provideValue called amd no valueProvider", () => {
    const fooIdentifier = "FooInterface";
    const fooBinding =  new Binding<Stubs.FooInterface>(fooIdentifier, BindingScopeEnum.Transient);
    expect(()=>fooBinding.provideValue(null as any, [])).to.throw(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${fooIdentifier}`)
  })

  it("Should get the value from the ValueProvider", () => {
    const fooIdentifier = "FooInterface";
    const fooBinding =  new Binding<Stubs.FooInterface>(fooIdentifier, BindingScopeEnum.Transient);
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
  })
});
