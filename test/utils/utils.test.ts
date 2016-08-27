import { expect } from "chai";
import { getFunctionName } from "../../src/utils/utils";

describe("Utils", () => {

    it("Should return a good function name", () => {

        function testFunction() {
            return false;
        }

        expect(getFunctionName(testFunction)).eql("testFunction");

    });

    it("Should return a good function name by using the regex", () => {

        const testFunction: any = { name: null };
        testFunction.toString = () => {
            return "function testFunction";
        };

        expect(getFunctionName(testFunction)).eql("testFunction");

    });

});
