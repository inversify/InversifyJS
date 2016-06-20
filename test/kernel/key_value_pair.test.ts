import { expect } from "chai";
import KeyValuePair from "../../src/kernel/key_value_pair";

describe("KeyValuePair", () => {

    it("Should set its own properties correctly", () => {

        let keyValuePair = new KeyValuePair<number>("test", 1);
        expect(keyValuePair.serviceIdentifier).eql("test");
        expect(keyValuePair.value.length).eql(1);
        expect(keyValuePair.value[0]).eql(1);

    });

});
