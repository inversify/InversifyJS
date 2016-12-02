import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { Lookup } from "../../src/container/lookup";
import { Binding } from "../../src/bindings/binding";
import { BindingScopeEnum } from "../../src/constants/literal_types";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

class ClonableValue<T> implements interfaces.Clonable<ClonableValue<T>> {
  public readonly val: T;
  public constructor(val: T) {
    this.val = val;
  }
  public clone () {
    return new ClonableValue<T>(this.val);
  }
}

describe("Lookup", () => {

  let invalid: any = null;

  it("Should throw when invoking get, remove or hasKey with a null key", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.get(invalid); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
    expect(() => { lookup.remove(invalid); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
    expect(() => { lookup.hasKey(invalid); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it("Should throw when attempting to add a null key", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.add(invalid, new ClonableValue<number>(1)); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it("Should throw when attempting to add a null value", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.add("TEST_KEY", null); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it("Should be able to link multiple values to a string key", () => {
    let lookup = new Lookup<any>();
    let key = "TEST_KEY";
    lookup.add(key, new ClonableValue<number>(1));
    lookup.add(key, new ClonableValue<number>(2));
    let result = lookup.get(key);
    expect(result.length).to.eql(2);
  });

  it("Should be able to link multiple values a symbol key", () => {
    let lookup = new Lookup<any>();
    let key = Symbol("TEST_KEY");
    lookup.add(key, new ClonableValue<number>(1));
    lookup.add(key, new ClonableValue<number>(2));
    let result = lookup.get(key);
    expect(result.length).to.eql(2);
  });

  it("Should throws when key not found", () => {
    let lookup = new Lookup<any>();
    expect(() => { lookup.get("THIS_KEY_IS_NOT_AVAILABLE"); }).to.throw(ERROR_MSGS.KEY_NOT_FOUND);
    expect(() => { lookup.remove("THIS_KEY_IS_NOT_AVAILABLE"); }).to.throw(ERROR_MSGS.KEY_NOT_FOUND);
  });

  it("Should be clonable", () => {

    let lookup = new Lookup<interfaces.Clonable<any>>();
    let key1 = Symbol("TEST_KEY");

    class Warrior {
      public kind: string;
      public constructor(kind: string) {
        this.kind = kind;
      }
      public clone() {
        return new Warrior(this.kind);
      }
    }

    lookup.add(key1, new Warrior("ninja"));
    lookup.add(key1, new Warrior("samurai"));

    let copy = lookup.clone();
    expect(copy.hasKey(key1)).to.eql(true);

    lookup.remove(key1);
    expect(copy.hasKey(key1)).to.eql(true);

  });

  it("Should be able to remove a binding by a condition", () => {

    let moduleId1 = "moduleId1";
    let moduleId2 = "moduleId2";
    let warriorId = "Warrior";
    let weaponId = "Weapon";

    let getLookup = () => {

      interface Warrior {}

      class Ninja implements Warrior {}
      let ninjaBinding = new Binding(warriorId, BindingScopeEnum.Transient);
      ninjaBinding.implementationType = Ninja;
      ninjaBinding.moduleId = moduleId1;

      class Samurai implements Warrior {}
      let samuraiBinding = new Binding(warriorId, BindingScopeEnum.Transient);
      samuraiBinding.implementationType = Samurai;
      samuraiBinding.moduleId = moduleId2;

      interface Weapon {}

      class Shuriken implements Weapon {}
      let shurikenBinding = new Binding(weaponId, BindingScopeEnum.Transient);
      shurikenBinding.implementationType = Shuriken;
      shurikenBinding.moduleId = moduleId1;

      class Katana implements Weapon {}
      let katanaBinding = new Binding(weaponId, BindingScopeEnum.Transient);
      katanaBinding.implementationType = Katana;
      katanaBinding.moduleId = moduleId2;

      let lookup = new Lookup<Binding<any>>();
      lookup.add(warriorId, ninjaBinding);
      lookup.add(warriorId, samuraiBinding);
      lookup.add(weaponId, shurikenBinding);
      lookup.add(weaponId, katanaBinding);

      return lookup;

    };

    let removeByModule = (expected: any) => (item: interfaces.Binding<any>): boolean => {
        return item.moduleId === expected;
    };

    let lookup1 = getLookup();
    expect(lookup1.hasKey(warriorId)).to.eql(true);
    expect(lookup1.hasKey(weaponId)).to.eql(true);
    expect(lookup1.get(warriorId).length).to.eql(2);
    expect(lookup1.get(weaponId).length).to.eql(2);

    let removeByModule1 = removeByModule(moduleId1);
    lookup1.removeByCondition(removeByModule1);
    expect(lookup1.hasKey(warriorId)).to.eql(true);
    expect(lookup1.hasKey(weaponId)).to.eql(true);
    expect(lookup1.get(warriorId).length).to.eql(1);
    expect(lookup1.get(weaponId).length).to.eql(1);

    let lookup2 = getLookup();
    expect(lookup2.hasKey(warriorId)).to.eql(true);
    expect(lookup2.hasKey(weaponId)).to.eql(true);
    expect(lookup2.get(warriorId).length).to.eql(2);
    expect(lookup2.get(weaponId).length).to.eql(2);

    let removeByModule2 = removeByModule(moduleId2);
    lookup2.removeByCondition(removeByModule1);
    lookup2.removeByCondition(removeByModule2);
    expect(lookup2.hasKey(warriorId)).to.eql(false);
    expect(lookup2.hasKey(weaponId)).to.eql(false);

  });

});
