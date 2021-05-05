import { expect } from "chai";
import { RootRequestScope } from "../../src/scope/root-request-scope"

describe("RootRequestScope", () => {
  it("Should return itself as clone", () => {
    const rootRequestScope = new RootRequestScope();
    expect(rootRequestScope.clone()).to.equal(rootRequestScope);
  })
})