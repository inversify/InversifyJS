import { expect } from "chai";
import { NotConfiguredScope } from "../../src/scope/not-configured-scope"
import * as ERROR_MSGS from "../../src/constants/error_msgs"
describe("NotConfiguredScope", () => {
  it("Should throw error when access get", () => {
    const notConfiguredScope = new NotConfiguredScope("Sid");
    expect(() => notConfiguredScope.get()).to.throw(`${ERROR_MSGS.INVALID_BINDING_TYPE} Sid`);
  });

  it("Should throw error when access set", () => {
    const notConfiguredScope = new NotConfiguredScope("Sid");
    expect(() => notConfiguredScope.set()).to.throw(`${ERROR_MSGS.INVALID_BINDING_TYPE} Sid`);
  });

  it("Should return itself when clone", () => {
    const notConfiguredScope = new NotConfiguredScope("Sid");
    const clone = notConfiguredScope.clone();
    expect(notConfiguredScope).to.equal(clone);
  })
});
