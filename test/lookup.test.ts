import { expect } from 'chai';
import { Lookup } from "../source/lookup";

describe('Lookup', () => {

  it('key cannot be null when invoking get() remove() or hasKey()', (done) => {
    var lookup = new Lookup<any>();

    expect(() => { lookup.get(null); }).to.throw("Argument Null");
    expect(() => { lookup.remove(null); }).to.throw("Argument Null");
    expect(() => { lookup.hasKey(null); }).to.throw("Argument Null");
    done();
  });

  it('key cannot be null when invoking add()', (done) => {
    var lookup = new Lookup<any>();
    var addFn = () => { lookup.add(null, 1); }
    expect(addFn).to.throw("Argument Null");
    done();
  });

  it('value cannot be null when invoking add()', (done) => {
    var lookup = new Lookup<any>();
    var addFn = () => { lookup.add("TEST_KEY", null); }
    expect(addFn).to.throw("Argument Null");
    done();
  });

  it('value cannot be null when invoking add()', (done) => {
    var lookup = new Lookup<any>();
    var key = "TEST_KEY";
    lookup.add(key, 1);
    lookup.add(key, 2);
    var result = lookup.get(key);
    expect(result.length).to.eql(2);
    done();
  });

  it('throws when key not found', (done) => {
    var lookup = new Lookup<any>();
    var fn = () => {
      lookup.get("THIS_KEY_IS_NOT_AVAILABLE");
    }
    expect(fn).to.throw("Key Not Found");
    done();
  });

});
