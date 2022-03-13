declare function __decorate(
  decorators: ClassDecorator[],
  target: NewableFunction,
  key?: string | symbol,
  descriptor?: PropertyDescriptor | undefined
): void;
declare function __param(paramIndex: number, decorator: ParameterDecorator): ClassDecorator;

import { expect } from 'chai';
import { decorate } from '../../src/annotation/decorator_utils';
import { named } from '../../src/annotation/named';
import * as ERROR_MSGS from '../../src/constants/error_msgs';
import * as METADATA_KEY from '../../src/constants/metadata_keys';
import { interfaces } from '../../src/interfaces/interfaces';

interface Weapon { }

class NamedWarrior {

  private _primaryWeapon: Weapon;
  private _secondaryWeapon: Weapon;

  public constructor(
    @named('more_powerful') primary: Weapon,
    @named('less_powerful') secondary: Weapon) {

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
    secondary: Weapon
  ) {

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

describe('@named', () => {

  it('Should generate metadata for named parameters', () => {

    const metadataKey = METADATA_KEY.TAGGED;
    const paramsMetadata = Reflect.getMetadata(metadataKey, NamedWarrior);
    expect(paramsMetadata).to.be.an('object');

    // assert metadata for first argument
    expect(paramsMetadata['0']).to.be.instanceof(Array);
    const m1: interfaces.Metadata = paramsMetadata['0'][0];
    expect(m1.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(m1.value).to.be.eql('more_powerful');
    expect(paramsMetadata['0'][1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['1']).to.be.instanceof(Array);
    const m2: interfaces.Metadata = paramsMetadata['1'][0];
    expect(m2.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(m2.value).to.be.eql('less_powerful');
    expect(paramsMetadata['1'][1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['2']).to.eq(undefined);

  });

  it('Should generate metadata for named properties', () => {

    class Warrior {
      @named('throwable')
      public weapon!: Weapon;
    }

    const metadataKey = METADATA_KEY.TAGGED_PROP;
    const metadata = Reflect.getMetadata(metadataKey, Warrior);

    const m1 = metadata.weapon[0];
    expect(m1.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(m1.value).to.be.eql('throwable');
    expect(metadata.weapon[1]).to.eq(undefined);

  });

  it('Should throw when applied multiple times', () => {

    const useDecoratorMoreThanOnce = function () {
      __decorate([__param(0, named('a')), __param(0, named('b'))], InvalidDecoratorUsageWarrior);
    };

    const msg = `${ERROR_MSGS.DUPLICATED_METADATA} ${METADATA_KEY.NAMED_TAG}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);

  });

  it('Should throw when not applied to a constructor', () => {

    const useDecoratorOnMethodThatIsNotAConstructor = function () {
      __decorate([__param(0, named('a'))],
        InvalidDecoratorUsageWarrior.prototype as unknown as NewableFunction,
        'test', Object.getOwnPropertyDescriptor(InvalidDecoratorUsageWarrior.prototype, 'test'));
    };

    const msg = `${ERROR_MSGS.INVALID_DECORATOR_OPERATION}`;
    expect(useDecoratorOnMethodThatIsNotAConstructor).to.throw(msg);

  });

  it('Should be usable in VanillaJS applications', () => {

    interface Katana { }
    interface Shurien { }

    const VanillaJSWarrior = (function () {
      function NamedVanillaJSWarrior(primary: Katana, secondary: Shurien) {
        // ...
      }
      return NamedVanillaJSWarrior;
    })();

    decorate(named('more_powerful'), VanillaJSWarrior, 0);
    decorate(named('less_powerful'), VanillaJSWarrior, 1);

    const metadataKey = METADATA_KEY.TAGGED;
    const paramsMetadata = Reflect.getMetadata(metadataKey, VanillaJSWarrior);
    expect(paramsMetadata).to.be.an('object');

    // assert metadata for first argument
    expect(paramsMetadata['0']).to.be.instanceof(Array);
    const m1: interfaces.Metadata = paramsMetadata['0'][0];
    expect(m1.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(m1.value).to.be.eql('more_powerful');
    expect(paramsMetadata['0'][1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['1']).to.be.instanceof(Array);
    const m2: interfaces.Metadata = paramsMetadata['1'][0];
    expect(m2.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(m2.value).to.be.eql('less_powerful');
    expect(paramsMetadata['1'][1]).eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['2']).to.eq(undefined);

  });

});