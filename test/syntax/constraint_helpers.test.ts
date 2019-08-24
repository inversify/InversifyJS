import { expect } from "chai";
import { andConstraint, notConstraint, orConstraint, typeConstraint } from "../../src/syntax/constraint_helpers";

describe("BindingInSyntax", () => {

    it("Should be return false when a request object is not provided", () => {

        const result = typeConstraint("TYPE")(null);
        expect(result).to.eql(false);

    });
});
describe("Not/and/or", () => {
    describe("Not", () => {
        it("Should create a constraint that is the not of the provided constraint", () => {
            expect(notConstraint(() => false)(null)).eql(true);
            expect(notConstraint(() => true)(null)).eql(false);
        });
    });
    describe("And", () => {
        it("Should create a constraint that is true if all provided constraints return true", () => {
            expect(andConstraint(
                () => false,
                () => true)(null)).eql(false);
            expect(andConstraint(
                () => true,
                () => true)(null)).eql(true);
        });
    });
    describe("Or", () => {
        it("Should create a constraint that is true if all provided constraints return true", () => {
            expect(orConstraint(
                () => false,
                () => true)(null)).eql(true);
            expect(orConstraint(
                () => false,
                () => false)(null)).eql(false);
        });
    });
});
