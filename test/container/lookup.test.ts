
import { expect } from 'chai';
import { Binding } from '../../src/bindings/binding';
import * as ERROR_MSGS from '../../src/constants/error_msgs';
import { BindingScopeEnum } from '../../src/constants/literal_types';
import { Lookup } from '../../src/container/lookup';
import { interfaces } from '../../src/interfaces/interfaces';

class ClonableValue<T> implements interfaces.Clonable<ClonableValue<T>> {
  public readonly val: T;
  public constructor(val: T) {
    this.val = val;
  }
  public clone() {
    return new ClonableValue<T>(this.val);
  }
}

describe('Lookup', () => {

  const invalid = null as unknown as interfaces.ServiceIdentifier<unknown>;

  it('Should throw when invoking get, remove or hasKey with a null key', () => {
    const lookup = new Lookup();
    expect(() => { lookup.get(invalid); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
    expect(() => { lookup.remove(invalid); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
    expect(() => { lookup.hasKey(invalid); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it('Should throw when attempting to add a null key', () => {
    const lookup = new Lookup<unknown>();
    expect(() => { lookup.add(invalid, new ClonableValue<number>(1)); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it('Should throw when attempting to add a null value', () => {
    const lookup = new Lookup<unknown>();
    expect(() => { lookup.add('TEST_KEY', null); }).to.throw(ERROR_MSGS.NULL_ARGUMENT);
  });

  it('Should be able to link multiple values to a string key', () => {
    const lookup = new Lookup<unknown>();
    const key = 'TEST_KEY';
    lookup.add(key, new ClonableValue<number>(1));
    lookup.add(key, new ClonableValue<number>(2));
    const result = lookup.get(key);
    expect(result.length).to.eql(2);
  });

  it('Should be able to link multiple values a symbol key', () => {
    const lookup = new Lookup<unknown>();
    const key = Symbol.for('TEST_KEY');
    lookup.add(key, new ClonableValue<number>(1));
    lookup.add(key, new ClonableValue<number>(2));
    const result = lookup.get(key);
    expect(result.length).to.eql(2);
  });

  it('Should throws when key not found', () => {
    const lookup = new Lookup<unknown>();
    expect(() => { lookup.get('THIS_KEY_IS_NOT_AVAILABLE'); }).to.throw(ERROR_MSGS.KEY_NOT_FOUND);
    expect(() => { lookup.remove('THIS_KEY_IS_NOT_AVAILABLE'); }).to.throw(ERROR_MSGS.KEY_NOT_FOUND);
  });

  it('Should be clonable', () => {

    const lookup = new Lookup<interfaces.Clonable<unknown>>();
    const key1 = Symbol.for('TEST_KEY');

    class Warrior {
      public kind: string;
      public constructor(kind: string) {
        this.kind = kind;
      }
      public clone() {
        return new Warrior(this.kind);
      }
    }

    lookup.add(key1, new Warrior('ninja'));
    lookup.add(key1, new Warrior('samurai'));

    const copy = lookup.clone();
    expect(copy.hasKey(key1)).to.eql(true);

    lookup.remove(key1);
    expect(copy.hasKey(key1)).to.eql(true);

  });

  it('Should use use the original non clonable entry if it is not clonable', () => {
    const lookup = new Lookup<unknown>();
    const key1 = Symbol.for('TEST_KEY');

    class Warrior {
      public kind: string;
      public constructor(kind: string) {
        this.kind = kind;
      }
    }
    const warrior = new Warrior('ninja')
    lookup.add(key1, warrior);

    const copy = lookup.clone();
    expect(copy.get(key1)[0] === warrior).to.eql(true);

  })

  it('Should be able to remove a binding by a condition', () => {

    const moduleId1 = 1;
    const moduleId2 = 2;
    const warriorId = 'Warrior';
    const weaponId = 'Weapon';

    const getLookup = () => {

      interface Warrior { }

      class Ninja implements Warrior { }
      const ninjaBinding = new Binding(warriorId, BindingScopeEnum.Transient);
      ninjaBinding.implementationType = Ninja;
      ninjaBinding.moduleId = moduleId1;

      class Samurai implements Warrior { }
      const samuraiBinding = new Binding(warriorId, BindingScopeEnum.Transient);
      samuraiBinding.implementationType = Samurai;
      samuraiBinding.moduleId = moduleId2;

      interface Weapon { }

      class Shuriken implements Weapon { }
      const shurikenBinding = new Binding(weaponId, BindingScopeEnum.Transient);
      shurikenBinding.implementationType = Shuriken;
      shurikenBinding.moduleId = moduleId1;

      class Katana implements Weapon { }
      const katanaBinding = new Binding(weaponId, BindingScopeEnum.Transient);
      katanaBinding.implementationType = Katana;
      katanaBinding.moduleId = moduleId2;

      const lookup = new Lookup<Binding<unknown>>();
      lookup.add(warriorId, ninjaBinding);
      lookup.add(warriorId, samuraiBinding);
      lookup.add(weaponId, shurikenBinding);
      lookup.add(weaponId, katanaBinding);

      return lookup;

    };

    const removeByModule = (expected: unknown) => (item: interfaces.Binding<unknown>): boolean =>
      item.moduleId === expected;

    const lookup1 = getLookup();
    expect(lookup1.hasKey(warriorId)).to.eql(true);
    expect(lookup1.hasKey(weaponId)).to.eql(true);
    expect(lookup1.get(warriorId).length).to.eql(2);
    expect(lookup1.get(weaponId).length).to.eql(2);

    const removeByModule1 = removeByModule(moduleId1);
    lookup1.removeByCondition(removeByModule1);
    expect(lookup1.hasKey(warriorId)).to.eql(true);
    expect(lookup1.hasKey(weaponId)).to.eql(true);
    expect(lookup1.get(warriorId).length).to.eql(1);
    expect(lookup1.get(weaponId).length).to.eql(1);

    const lookup2 = getLookup();
    expect(lookup2.hasKey(warriorId)).to.eql(true);
    expect(lookup2.hasKey(weaponId)).to.eql(true);
    expect(lookup2.get(warriorId).length).to.eql(2);
    expect(lookup2.get(weaponId).length).to.eql(2);

    const removeByModule2 = removeByModule(moduleId2);
    lookup2.removeByCondition(removeByModule1);
    lookup2.removeByCondition(removeByModule2);
    expect(lookup2.hasKey(warriorId)).to.eql(false);
    expect(lookup2.hasKey(weaponId)).to.eql(false);

  });

  it('should be able to remove the intersection with another lookup', () => {
    const lookup = new Lookup<unknown>();

    const serviceIdentifier1 = 'service-identifier-1';
    const serviceIdentifier2 = 'service-identifier-2';

    const serviceIdentifier1Values = [11, 12, 13, 14];
    const serviceIdentifier2Values = [21, 22, 23, 24];

    for (const value of serviceIdentifier1Values) {
      lookup.add(serviceIdentifier1, value);
    }

    for (const value of serviceIdentifier2Values) {
      lookup.add(serviceIdentifier2, value);
    }

    const lookupToIntersect = new Lookup<unknown>();

    const lookupToIntersectServiceIdentifier2Values = [23, 24, 25, 26];

    const serviceIdentifier3 = 'service-identifier-3';

    const lookupToIntersectServiceIdentifier3Values = [31, 32, 33, 34];

    for (const value of lookupToIntersectServiceIdentifier2Values) {
      lookupToIntersect.add(serviceIdentifier2, value);
    }

    for (const value of lookupToIntersectServiceIdentifier3Values) {
      lookupToIntersect.add(serviceIdentifier3, value);
    }

    lookup.removeIntersection(lookupToIntersect);

    expect(lookup.getMap()).to.deep.equal(new Map([
      [serviceIdentifier1, [...serviceIdentifier1Values]],
      [serviceIdentifier2, [21, 22]],
    ]));
  });

});