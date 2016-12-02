import { expect } from "chai";
import { typeConstraint } from "../../src/syntax/constraint_helpers";

describe("BindingInSyntax", () => {

    it("Should be return false when a request object is not provided", () => {

        let result = typeConstraint("TYPE")(null);
        expect(result).to.eql(false);

    });

});
