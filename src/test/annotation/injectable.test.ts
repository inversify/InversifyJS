import { expect } from 'chai';

import * as ERRORS_MSGS from '../../constants/error_msgs';
import * as METADATA_KEY from '../../constants/metadata_keys';
import { decorate, injectable } from '../../index';

describe('@injectable', () => {
  it('Should generate metadata if declared injections', () => {
    class Katana {}

    type Weapon = unknown;

    @injectable()
    class Warrior {
      private readonly _primaryWeapon: Katana;
      private readonly _secondaryWeapon: Weapon;

      constructor(primaryWeapon: Katana, secondaryWeapon: Weapon) {
        this._primaryWeapon = primaryWeapon;
        this._secondaryWeapon = secondaryWeapon;
      }

      public debug() {
        return {
          primaryWeapon: this._primaryWeapon,
          secondaryWeapon: this._secondaryWeapon,
        };
      }
    }

    const metadata: NewableFunction[] = Reflect.getMetadata(
      METADATA_KEY.PARAM_TYPES,
      Warrior,
    ) as NewableFunction[];
    expect(metadata).to.be.instanceof(Array);

    expect(metadata[0]).to.be.eql(Katana);
    expect(metadata[1]).to.be.eql(Object);
    expect(metadata[2]).to.eq(undefined);
  });

  it('Should throw when applied multiple times', () => {
    @injectable()
    class Test {}

    const useDecoratorMoreThanOnce: () => void = function () {
      decorate(injectable(), Test);
      decorate(injectable(), Test);
    };

    expect(useDecoratorMoreThanOnce).to.throw(
      ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR,
    );
  });

  it('Should be usable in VanillaJS applications', () => {
    type Katana = unknown;
    type Shuriken = unknown;

    const vanillaJsWarrior: (primary: unknown, secondary: unknown) => void =
      function (_primary: Katana, _secondary: Shuriken) {};

    decorate(injectable(), vanillaJsWarrior);

    const metadata: NewableFunction[] = Reflect.getMetadata(
      METADATA_KEY.PARAM_TYPES,
      vanillaJsWarrior,
    ) as NewableFunction[];

    expect(metadata).to.be.instanceof(Array);
    expect(metadata.length).to.eql(0);
  });
});
