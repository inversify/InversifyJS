declare function __decorate(
  decorators: ClassDecorator[],
  target: NewableFunction,
  key?: string | symbol,
  descriptor?: PropertyDescriptor | undefined
): void;
declare function __param(paramIndex: number, decorator: ParameterDecorator): ClassDecorator;

import { expect } from 'chai';
import { decorate } from '../../src/annotation/decorator_utils';
import { multiInject } from '../../src/annotation/multi_inject';
import * as ERROR_MSGS from '../../src/constants/error_msgs';
import * as METADATA_KEY from '../../src/constants/metadata_keys';
import { interfaces } from '../../src/interfaces/interfaces';

interface Weapon { }

class DecoratedWarrior {

  private _primaryWeapon: Weapon;
  private _secondaryWeapon: Weapon;

  public constructor(
    @multiInject('Weapon') weapons: Weapon[]
  ) {

    this._primaryWeapon = weapons[0] as Weapon;
    this._secondaryWeapon = weapons[1] as Weapon;
  }

  public mock() {
    return `${JSON.stringify(this._primaryWeapon)} ${JSON.stringify(this._secondaryWeapon)}`;
  }

}

class InvalidDecoratorUsageWarrior {

  private _primaryWeapon: Weapon;
  private _secondaryWeapon: Weapon;

  public constructor(
    weapons: Weapon[]
  ) {
    this._primaryWeapon = weapons[0] as Weapon;
    this._secondaryWeapon = weapons[1] as Weapon;
  }

  public test(a: string) { /*...*/ }

  public debug() {
    return {
      primaryWeapon: this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon
    };
  }

}

describe('@multiInject', () => {

  it('Should generate metadata for named parameters', () => {
    const metadataKey = METADATA_KEY.TAGGED;
    const paramsMetadata = Reflect.getMetadata(metadataKey, DecoratedWarrior);
    expect(paramsMetadata).to.be.an('object');

    // assert metadata for first argument
    expect(paramsMetadata['0']).to.be.instanceof(Array);
    const m1: interfaces.Metadata = paramsMetadata['0'][0];
    expect(m1.key).to.be.eql(METADATA_KEY.MULTI_INJECT_TAG);
    expect(m1.value).to.be.eql('Weapon');
    expect(paramsMetadata['0'][1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['1']).to.eq(undefined);

  });

  it('Should throw when applied multiple times', () => {

    const useDecoratorMoreThanOnce = function () {
      __decorate([__param(0, multiInject('Weapon')), __param(0, multiInject('Weapon'))], InvalidDecoratorUsageWarrior);
    };

    const msg = `${ERROR_MSGS.DUPLICATED_METADATA} ${METADATA_KEY.MULTI_INJECT_TAG}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);

  });

  it('Should throw when not applied to a constructor', () => {

    const useDecoratorOnMethodThatIsNotAConstructor = function () {
      __decorate([__param(0, multiInject('Weapon'))],
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
      function Warrior(primary: Katana, secondary: Shurien) {
        // ...
      }
      return Warrior;
    })();

    decorate(multiInject('Weapon'), VanillaJSWarrior, 0);

    const metadataKey = METADATA_KEY.TAGGED;
    const paramsMetadata = Reflect.getMetadata(metadataKey, VanillaJSWarrior);
    expect(paramsMetadata).to.be.an('object');

    // assert metadata for first argument
    expect(paramsMetadata['0']).to.be.instanceof(Array);
    const m1: interfaces.Metadata = paramsMetadata['0'][0];
    expect(m1.key).to.be.eql(METADATA_KEY.MULTI_INJECT_TAG);
    expect(m1.value).to.be.eql('Weapon');
    expect(paramsMetadata['0'][1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['1']).to.eq(undefined);

  });

});