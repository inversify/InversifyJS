import { expect } from 'chai';

import { Container, inject, injectable, named } from '../..';

describe('Named default', () => {
  it('Should be able to inject a default to avoid ambiguous binding exceptions', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Warrior: 'Warrior',
      Weapon: 'Weapon',
    };

    // eslint-disable-next-line @typescript-eslint/typedef
    const TAG = {
      chinese: 'chinese',
      japanese: 'japanese',
      throwable: 'throwable',
    };

    interface Weapon {
      name: string;
    }

    interface Warrior {
      name: string;
      weapon: Weapon;
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
    class Samurai implements Warrior {
      public name: string;
      public weapon: Weapon;
      constructor(@inject(TYPES.Weapon) weapon: Weapon) {
        this.name = 'Samurai';
        this.weapon = weapon;
      }
    }

    @injectable()
    class Ninja implements Warrior {
      public name: string;
      public weapon: Weapon;
      constructor(@inject(TYPES.Weapon) @named(TAG.throwable) weapon: Weapon) {
        this.name = 'Ninja';
        this.weapon = weapon;
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>(TYPES.Warrior).to(Ninja).whenNamed(TAG.chinese);
    container.bind<Warrior>(TYPES.Warrior).to(Samurai).whenNamed(TAG.japanese);
    container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenNamed(TAG.throwable);
    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenDefault();

    const ninja: Warrior = container.get<Warrior>(TYPES.Warrior, {
      name: TAG.chinese,
    });
    const samurai: Warrior = container.get<Warrior>(TYPES.Warrior, {
      name: TAG.japanese,
    });

    expect(ninja.name).to.eql('Ninja');
    expect(ninja.weapon.name).to.eql('Shuriken');
    expect(samurai.name).to.eql('Samurai');
    expect(samurai.weapon.name).to.eql('Katana');
  });

  it('Should be able to select a default to avoid ambiguous binding exceptions', () => {
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

    const container: Container = new Container();
    container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenNamed(TAG.throwable);
    container
      .bind<Weapon>(TYPES.Weapon)
      .to(Katana)
      .inSingletonScope()
      .whenDefault();

    const defaultWeapon: Weapon = container.get<Weapon>(TYPES.Weapon);
    const throwableWeapon: Weapon = container.get<Weapon>(TYPES.Weapon, {
      name: TAG.throwable,
    });

    expect(defaultWeapon.name).eql('Katana');
    expect(throwableWeapon.name).eql('Shuriken');
  });
});
