import { expect } from 'chai';
import * as ERRORS_MSGS from '../../src/constants/error_msgs';
import * as METADATA_KEY from '../../src/constants/metadata_keys';
import { decorate, injectable } from '../../src/inversify';

describe('@injectable', () => {

  it('Should generate metadata if declared injections', () => {

    class Katana { }

    interface Weapon { }

    @injectable()
    class Warrior {

      private _primaryWeapon: Katana;
      private _secondaryWeapon: Weapon;

      public constructor(primaryWeapon: Katana, secondaryWeapon: Weapon) {
        this._primaryWeapon = primaryWeapon;
        this._secondaryWeapon = secondaryWeapon;
      }

      public debug() {
        return {
          primaryWeapon: this._primaryWeapon,
          secondaryWeapon: this._secondaryWeapon
        };
      }

    }

    const metadata = Reflect.getMetadata(METADATA_KEY.PARAM_TYPES, Warrior);
    expect(metadata).to.be.instanceof(Array);

    expect(metadata[0]).to.be.eql(Katana);
    expect(metadata[1]).to.be.eql(Object);
    expect(metadata[2]).to.eq(undefined);
  });

  it('Should throw when applied multiple times', () => {

    @injectable()
    class Test { }

    const useDecoratorMoreThanOnce = function () {
      decorate(injectable(), Test);
      decorate(injectable(), Test);
    };

    expect(useDecoratorMoreThanOnce).to.throw(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
  });

  it('Should be usable in VanillaJS applications', () => {

    interface Katana { }
    interface Shuriken { }

    const VanillaJSWarrior = function (primary: Katana, secondary: Shuriken) {
      // ...
    };

    decorate(injectable(), VanillaJSWarrior);

    const metadata = Reflect.getMetadata(METADATA_KEY.PARAM_TYPES, VanillaJSWarrior);
    expect(metadata).to.be.instanceof(Array);
    expect(metadata.length).to.eql(0);

  });

});