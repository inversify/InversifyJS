import { expect } from 'chai';
import { injectable, inject, optional, Container, named } from '../../src/inversify';

describe('Issue 1190', () => {

  it('should inject a katana as default weapon to ninja', () => {
    const TYPES = {
      Weapon: 'Weapon'
    };

    const TAG = {
      throwable: 'throwable'
    };

    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      public constructor() {
        this.name = 'Katana';
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      public constructor() {
        this.name = 'Shuriken';
      }
    }

    @injectable()
    class Ninja {
      public name: string;
      public katana: Katana;
      public shuriken: Shuriken;
      public constructor(
        @inject(TYPES.Weapon) @optional() katana: Weapon,
        @inject(TYPES.Weapon) @named(TAG.throwable) shuriken: Weapon
      ) {
        this.name = 'Ninja';
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container = new Container();

    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();
    container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);

    container.bind<Ninja>('Ninja').to(Ninja);

    const ninja = container.get<Ninja>('Ninja');

    expect(ninja.katana).to.deep.eq(new Katana());
  });
});