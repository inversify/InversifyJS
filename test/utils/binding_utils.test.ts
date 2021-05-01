import { expect } from "chai";
import { Binding } from "../../src/bindings/binding";
import {_getFactoryDetails} from "../../src/utils/binding_utils";

describe("getFactoryDetails", () => {
  it("should return null for non factory binding.type", () => {
    const binding = new Binding("","Singleton");
    binding.type = "Instance";
    expect(_getFactoryDetails(binding) === null).to.equal(true);
  });
})
