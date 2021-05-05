import { expect } from "chai";
import { Stack } from "../../src/container/stack"

describe("stack", () => {
  it("should work as expected", () => {
    const stack = new Stack<string>();
    // tslint:disable: no-unused-expression
    expect(stack.peek()).to.be.undefined;
    expect(stack.pop()).to.be.undefined;
    stack.push("First");
    expect(stack.peek()).to.equal("First");
    stack.push("Second");
    expect(stack.peek()).to.equal("Second");
    expect(stack.pop()).to.equal("Second");
    expect(stack.peek()).to.equal("First");
    expect(stack.pop()).to.equal("First");
  })
})