import { LazyServiceIdentifier } from '@inversifyjs/common';
import { expect } from 'chai';

import { decorate, inject, ServiceIdentifier } from '../..';

class Katana {}
class Shuriken {}

const lazySwordId: LazyServiceIdentifier = new LazyServiceIdentifier(
  () => 'Sword',
);

class InvalidDecoratorUsageWarrior {
  private readonly _primaryWeapon: Katana;
  private readonly _secondaryWeapon: Shuriken;

  constructor(primary: Katana, secondary: Shuriken) {
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

describe('@inject', () => {
  it('Should throw when applied multiple times', () => {
    const useDecoratorMoreThanOnce: () => void = function () {
      decorate(
        [inject('Katana'), inject('Shuriken')],
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

  it('Should unwrap LazyServiceIdentifier', () => {
    const unwrapped: ServiceIdentifier = lazySwordId.unwrap();

    expect(unwrapped).to.be.equal('Sword');
  });
});
