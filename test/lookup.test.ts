import { expect } from 'chai';
import { Lookup } from "../source/lookup";

describe('Lookup', () => {

  it('key cannot be null when invoking get() remove() or hasKey()', () => {
    var lookup = new Lookup<any>();
    expect(() => { lookup.get(null); }).to.throw("Argument Null");
    expect(() => { lookup.remove(null); }).to.throw("Argument Null");
    expect(() => { lookup.hasKey(null); }).to.throw("Argument Null");
  });

  it('key cannot be null when invoking add()', () => {
    var lookup = new Lookup<any>();
    expect(() => { lookup.add(null, 1); }).to.throw("Argument Null");
  });

  it('value cannot be null when invoking add()', () => {
    var lookup = new Lookup<any>();
    expect(() => { lookup.add("TEST_KEY", null); }).to.throw("Argument Null");
  });

  it('value cannot be null when invoking add()', () => {
    var lookup = new Lookup<any>();
    var key = "TEST_KEY";
    lookup.add(key, 1);
    lookup.add(key, 2);
    var result = lookup.get(key);
    expect(result.length).to.eql(2);
  });

  it('throws when key not found', () => {
    var lookup = new Lookup<any>();
    expect(() => { lookup.get("THIS_KEY_IS_NOT_AVAILABLE"); }).to.throw("Key Not Found");
  });

});
