///<reference path="../../typings/browser.d.ts" />

import { expect } from "chai";
import Lookup from "../../src/kernel/lookup";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

describe("Lookup", () => {

  it("Should throw when invoking get, remove or hasKey with a null key", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.get(null); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
    expect(() => { lookup.remove(null); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
    expect(() => { lookup.hasKey(null); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it("Should throw when attempting to add a null key", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.add(null, 1); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it("Should throw when attempting to add a null value", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.add("TEST_KEY", null); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it("Should be able to link multiple values to a key", () => {
    let lookup = new Lookup<any>();
    let key = "TEST_KEY";
    lookup.add(key, 1);
    lookup.add(key, 2);
    let result = lookup.get(key);
    expect(result.length).to.eql(2);
  });

  it("Should throws when key not found", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.get("THIS_KEY_IS_NOT_AVAILABLE"); }).to.throw(ERROR_MSGS.KEY_NOT_FOUND);
    expect(() => { lookup.remove("THIS_KEY_IS_NOT_AVAILABLE"); }).to.throw(ERROR_MSGS.KEY_NOT_FOUND);
  });

});
