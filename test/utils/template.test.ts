import { expect } from "chai";
import { template } from "../../src/utils/template";

describe("template", () => {

  it("Should genereate a string with the args filled in", () => {
      let message = template`start: ${"a"},${1}: finish`;
      let strA = "testA";
      let str1 = "test1";

      expect(message(strA, str1)).to.be.equal("start: testA,test1: finish");
  });

});
