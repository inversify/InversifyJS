import { expect } from 'chai';

import { Container, inject, injectable, named, optional } from '../../index';

describe('Issue 1190', () => {
  it('should inject a katana as default weapon to ninja', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Weapon: 'Weapon',
    };

    // eslint-disable-next-line @typescript-eslint/typedef
    const TAG = {
      throwable: 'throwable',
    };

    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      constructor() {
        this.name = 'Katana';
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      constructor() {
        this.name = 'Shuriken';
      }
    }

    @injectable()
    class Ninja {
      public name: string;
      public katana: Katana;
      public shuriken: Shuriken;
      constructor(
        @inject(TYPES.Weapon) @optional() katana: Weapon,
        @inject(TYPES.Weapon) @named(TAG.throwable) shuriken: Weapon,
      ) {
        this.name = 'Ninja';
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container: Container = new Container();

    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenDefault();
    container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenNamed(TAG.throwable);

    container.bind<Ninja>('Ninja').to(Ninja);

    const ninja: Ninja = container.get<Ninja>('Ninja');

    expect(ninja.katana).to.deep.eq(new Katana());
  });
});
