declare function __decorate(
  decorators: ClassDecorator[],
  target: NewableFunction,
  key?: string | symbol,
  descriptor?: PropertyDescriptor | undefined
): void;
declare function __param(paramIndex: number, decorator: ParameterDecorator): ClassDecorator;

import { expect } from 'chai';
import { decorate } from '../../src/annotation/decorator_utils';
import { tagged } from '../../src/annotation/tagged';
import * as ERRORS_MSGS from '../../src/constants/error_msgs';
import * as METADATA_KEY from '../../src/constants/metadata_keys';
import { interfaces } from '../../src/interfaces/interfaces';

interface Weapon { }

class TaggedWarrior {

  private _primaryWeapon: Weapon;
  private _secondaryWeapon: Weapon;

  public constructor(
    @tagged('power', 1) primary: Weapon,
    @tagged('power', 2) secondary: Weapon) {

    this._primaryWeapon = primary;
    this._secondaryWeapon = secondary;
  }
  public debug() {
    return {
      primaryWeapon: this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon
    };
  }
}

class DoubleTaggedWarrior {

  private _primaryWeapon: Weapon;
  private _secondaryWeapon: Weapon;

  public constructor(
    @tagged('power', 1) @tagged('distance', 1) primary: Weapon,
    @tagged('power', 2) @tagged('distance', 5) secondary: Weapon) {

    this._primaryWeapon = primary;
    this._secondaryWeapon = secondary;
  }
  public debug() {
    return {
      primaryWeapon: this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon
    };
  }
}

class InvalidDecoratorUsageWarrior {

  private _primaryWeapon: Weapon;
  private _secondaryWeapon: Weapon;

  public constructor(
    primary: Weapon,
    secondary: Weapon) {

    this._primaryWeapon = primary;
    this._secondaryWeapon = secondary;
  }

  public test(a: string) { /*...*/ }

  public debug() {
    return {
      primaryWeapon: this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon
    };
  }
}

describe('@Tagged', () => {

  it('Should generate metadata for tagged parameters', () => {

    const metadataKey = METADATA_KEY.TAGGED;
    const paramsMetadata = Reflect.getMetadata(metadataKey, TaggedWarrior);
    expect(paramsMetadata).to.be.an('object');

    // assert metadata for first argument
    expect(paramsMetadata['0']).to.be.instanceof(Array);
    const m1: interfaces.Metadata = paramsMetadata['0'][0];
    expect(m1.key).to.be.eql('power');
    expect(m1.value).to.be.eql(1);

    // argument at index 0 should only have one tag
    expect(paramsMetadata['0'][1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['1']).to.be.instanceof(Array);
    const m2: interfaces.Metadata = paramsMetadata['1'][0];
    expect(m2.key).to.be.eql('power');
    expect(m2.value).to.be.eql(2);

    // argument at index 1 should only have one tag
    expect(paramsMetadata['1'][1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['2']).to.eq(undefined);
  });

  it('Should generate metadata for tagged properties', () => {

    class Warrior {
      @tagged('throwable', false)
      public weapon!: Weapon;
    }

    const metadataKey = METADATA_KEY.TAGGED_PROP;
    const metadata = Reflect.getMetadata(metadataKey, Warrior);
    const m1 = metadata.weapon[0];
    expect(m1.key).to.be.eql('throwable');
    expect(m1.value).to.be.eql(false);
    expect(metadata.weapon[1]).to.eq(undefined);

  });

  it('Should generate metadata for parameters tagged multiple times', () => {
    const metadataKey = METADATA_KEY.TAGGED;
    const paramsMetadata = Reflect.getMetadata(metadataKey, DoubleTaggedWarrior);
    expect(paramsMetadata).to.be.an('object');

    // assert metadata for argument at index 0
    expect(paramsMetadata['0']).to.be.instanceof(Array);

    // assert argument at index 0 first tag
    const m11: interfaces.Metadata = paramsMetadata['0'][0];
    expect(m11.key).to.be.eql('distance');
    expect(m11.value).to.be.eql(1);

    // assert argument at index 0 second tag
    const m12: interfaces.Metadata = paramsMetadata['0'][1];
    expect(m12.key).to.be.eql('power');
    expect(m12.value).to.be.eql(1);

    // assert metadata for argument at index 1
    expect(paramsMetadata['1']).to.be.instanceof(Array);

    // assert argument at index 1 first tag
    const m21: interfaces.Metadata = paramsMetadata['1'][0];
    expect(m21.key).to.be.eql('distance');
    expect(m21.value).to.be.eql(5);

    // assert argument at index 1 second tag
    const m22: interfaces.Metadata = paramsMetadata['1'][1];
    expect(m22.key).to.be.eql('power');
    expect(m22.value).to.be.eql(2);

    // no more metadata (argument at index > 1)
    expect(paramsMetadata['2']).to.eq(undefined);

  });

  it('Should throw when applied multiple times', () => {

    const metadataKey = 'a';

    const useDecoratorMoreThanOnce = function () {
      __decorate([__param(0, tagged(metadataKey, 1)), __param(0, tagged(metadataKey, 2))], InvalidDecoratorUsageWarrior);
    };

    const msg = `${ERRORS_MSGS.DUPLICATED_METADATA} ${metadataKey}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);

  });

  it('Should throw when not applied to a constructor', () => {

    const useDecoratorOnMethodThatIsNotAConstructor = function () {
      __decorate([__param(0, tagged('a', 1))],
        InvalidDecoratorUsageWarrior.prototype as unknown as NewableFunction,
        'test', Object.getOwnPropertyDescriptor(InvalidDecoratorUsageWarrior.prototype, 'test'));
    };

    const msg = ERRORS_MSGS.INVALID_DECORATOR_OPERATION;
    expect(useDecoratorOnMethodThatIsNotAConstructor).to.throw(msg);

  });

  it('Should be usable in VanillaJS applications', () => {

    interface Katana { }
    interface Shuriken { }

    const VanillaJSWarrior = (function () {
      function TaggedVanillaJSWarrior(primary: Katana, secondary: Shuriken) {
        // ...
      }
      return TaggedVanillaJSWarrior;
    })();

    decorate(tagged('power', 1), VanillaJSWarrior, 0);
    decorate(tagged('power', 2), VanillaJSWarrior, 1);

    const metadataKey = METADATA_KEY.TAGGED;
    const paramsMetadata = Reflect.getMetadata(metadataKey, VanillaJSWarrior);
    expect(paramsMetadata).to.be.an('object');

    // assert metadata for first argument
    expect(paramsMetadata['0']).to.be.instanceof(Array);
    const m1: interfaces.Metadata = paramsMetadata['0'][0];
    expect(m1.key).to.be.eql('power');
    expect(m1.value).to.be.eql(1);

    // argument at index 0 should only have one tag
    expect(paramsMetadata['0'][1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['1']).to.be.instanceof(Array);
    const m2: interfaces.Metadata = paramsMetadata['1'][0];
    expect(m2.key).to.be.eql('power');
    expect(m2.value).to.be.eql(2);

    // argument at index 1 should only have one tag
    expect(paramsMetadata['1'][1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['2']).to.eq(undefined);

  });

});