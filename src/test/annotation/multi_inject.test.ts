import { expect } from 'chai';

import { decorate, multiInject } from '../..';

type Weapon = object;

class InvalidDecoratorUsageWarrior {
  private readonly _primaryWeapon: Weapon;
  private readonly _secondaryWeapon: Weapon;

  constructor(weapons: [Weapon, Weapon]) {
    this._primaryWeapon = weapons[0];
    this._secondaryWeapon = weapons[1];
  }

  public test(_a: string) {}

  public debug() {
    return {
      primaryWeapon: this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon,
    };
  }
}

describe('@multiInject', () => {
  it('Should throw when applied multiple times', () => {
    const useDecoratorMoreThanOnce: () => void = function () {
      decorate(
        [multiInject('Katana'), multiInject('Shuriken')],
        InvalidDecoratorUsageWarrior,
        0,
      );
    };

    const msg: string = `Unexpected injection error.

Cause:

Unexpected injection found. Multiple @inject, @multiInject or @unmanaged decorators found

Details

[class: "InvalidDecoratorUsageWarrior", index: "0"]`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);
  });
});
