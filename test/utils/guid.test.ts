import { expect } from "chai";
import { guid } from "../../src/utils/guid";

describe("GUID", () => {

  it("Should be able to generate a guid", () => {
      let guid1 = guid();
      expect(guid1.length).eql(36);
  });

});
