import { expect } from "chai";
import { getFunctionName, listMetadataForTarget } from "../../src/utils/serialization";
import { Target } from "../../src/planning/target";
import { TargetTypeEnum } from "../../src/constants/literal_types";

describe("serialization", () => {

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

    it("Should not fail when target is not named or tagged", () => {
        let serviceIdentifier = "SomeTypeId";
        let target = new Target(TargetTypeEnum.Variable, "", serviceIdentifier);
        let list = listMetadataForTarget(serviceIdentifier, target);
        expect(list).to.eql(` ${serviceIdentifier}`);
    });

});
