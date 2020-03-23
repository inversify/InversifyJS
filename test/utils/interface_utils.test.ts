import { expect } from "chai";
import { createSymbolForInterface } from "../../src/utils/interface_utils";

describe("InterfaceUtils.createSymbolForInterface()", () => {
    it("Should return a symbol", () => {
        expect(createSymbolForInterface()).to.be.a("symbol");
    });
});
