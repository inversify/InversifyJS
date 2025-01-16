import { expect } from 'chai';

import { decorate, named } from '../..';

type Weapon = unknown;

class InvalidDecoratorUsageWarrior {
  private readonly _primaryWeapon: Weapon;
  private readonly _secondaryWeapon: Weapon;

  constructor(primary: Weapon, secondary: Weapon) {
    this._primaryWeapon = primary;
    this._secondaryWeapon = secondary;
  }

  public test(_a: string) {}

  public debug() {
    return {
      primaryWeapon: this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon,
    };
  }
}

describe('@named', () => {
  it('Should throw when applied multiple times', () => {
    const useDecoratorMoreThanOnce: () => void = function () {
      decorate(
        [named('Katana'), named('Shuriken')],
        InvalidDecoratorUsageWarrior,
        0,
      );
    };

    const msg: string = `Unexpected injection error.

Cause:

Unexpected duplicated named decorator

Details

[class: "InvalidDecoratorUsageWarrior", index: "0"]`;

    expect(useDecoratorMoreThanOnce).to.throw(msg);
  });
});
