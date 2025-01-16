import { expect } from 'chai';
import { performance } from 'perf_hooks';

import { Container, inject, injectable, named } from '../..';

describe('inRequestScope', () => {
  it('Should support request scope in basic bindings', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPE = {
      Warrior: Symbol('Warrior'),
      Weapon: Symbol('Weapon'),
    };

    interface Weapon {
      use(): string;
    }

    interface Warrior {
      primaryWeapon: Weapon;
      secondaryWeapon: Weapon;
    }

    @injectable()
    class Katana implements Weapon {
      private readonly _madeOn: number;
      constructor() {
        this._madeOn = performance.now();
      }
      public use() {
        return `Used Katana made on ${this._madeOn.toString()}!`;
      }
    }

    @injectable()
    class Samurai implements Warrior {
      public primaryWeapon: Weapon;
      public secondaryWeapon: Weapon;
      constructor(
        @inject(TYPE.Weapon) primaryWeapon: Weapon,
        @inject(TYPE.Weapon) secondaryWeapon: Weapon,
      ) {
        this.primaryWeapon = primaryWeapon;
        this.secondaryWeapon = secondaryWeapon;
      }
    }

    // Without request scope
    const container: Container = new Container();
    container.bind<Weapon>(TYPE.Weapon).to(Katana);
    container.bind<Warrior>(TYPE.Warrior).to(Samurai);
    const samurai: Warrior = container.get(TYPE.Warrior);
    const samurai2: Warrior = container.get(TYPE.Warrior);

    // One requests should use two instances because scope is transient
    expect(samurai.primaryWeapon.use()).not.to.eql(
      samurai.secondaryWeapon.use(),
    );

    // One requests should use two instances because scope is transient
    expect(samurai2.primaryWeapon.use()).not.to.eql(
      samurai2.secondaryWeapon.use(),
    );

    // Two request should use two Katana instances
    // for each instance of Samuari because scope is transient
    expect(samurai.primaryWeapon.use()).not.to.eql(
      samurai2.primaryWeapon.use(),
    );
    expect(samurai.secondaryWeapon.use()).not.to.eql(
      samurai2.secondaryWeapon.use(),
    );

    // With request scope
    const container1: Container = new Container();
    container1.bind<Weapon>(TYPE.Weapon).to(Katana).inRequestScope(); // Important
    container1.bind<Warrior>(TYPE.Warrior).to(Samurai);
    const samurai3: Warrior = container1.get(TYPE.Warrior);
    const samurai4: Warrior = container1.get(TYPE.Warrior);

    // One requests should use one instance because scope is request scope
    expect(samurai3.primaryWeapon.use()).to.eql(samurai3.secondaryWeapon.use());

    // One requests should use one instance because scope is request scope
    expect(samurai4.primaryWeapon.use()).to.eql(samurai4.secondaryWeapon.use());

    // Two request should use one instances of Katana
    // for each instance of Samurai because scope is request scope
    expect(samurai3.primaryWeapon.use()).not.to.eql(
      samurai4.primaryWeapon.use(),
    );
    expect(samurai3.secondaryWeapon.use()).not.to.eql(
      samurai4.secondaryWeapon.use(),
    );
  });

  it('Should support request scope when using contraints', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPE = {
      Warrior: Symbol('Warrior'),
      Weapon: Symbol('Weapon'),
    };

    interface Weapon {
      use(): string;
    }

    interface Warrior {
      primaryWeapon: Weapon;
      secondaryWeapon: Weapon;
      tertiaryWeapon: Weapon;
    }

    @injectable()
    class Katana implements Weapon {
      private readonly _madeOn: number;
      constructor() {
        this._madeOn = performance.now();
      }
      public use() {
        return `Used Katana made on ${this._madeOn.toString()}!`;
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      private readonly _madeOn: number;
      constructor() {
        this._madeOn = performance.now();
      }
      public use() {
        return `Used Shuriken made on ${this._madeOn.toString()}!`;
      }
    }

    @injectable()
    class Samurai implements Warrior {
      public primaryWeapon: Weapon;
      public secondaryWeapon: Weapon;
      public tertiaryWeapon: Weapon;
      constructor(
        @inject(TYPE.Weapon) @named('sword') primaryWeapon: Weapon,
        @inject(TYPE.Weapon) @named('throwable') secondaryWeapon: Weapon,
        @inject(TYPE.Weapon) @named('throwable') tertiaryWeapon: Weapon,
      ) {
        this.primaryWeapon = primaryWeapon;
        this.secondaryWeapon = secondaryWeapon;
        this.tertiaryWeapon = tertiaryWeapon;
      }
    }

    const container: Container = new Container();

    container
      .bind<Weapon>(TYPE.Weapon)
      .to(Katana)
      .inRequestScope()
      .whenNamed('sword');

    container
      .bind<Weapon>(TYPE.Weapon)
      .to(Shuriken)
      .inRequestScope()
      .whenNamed('throwable');

    container.bind<Warrior>(TYPE.Warrior).to(Samurai);

    const samurai1: Warrior = container.get<Warrior>(TYPE.Warrior);
    const samurai2: Warrior = container.get<Warrior>(TYPE.Warrior);

    // Katana and Shuriken are two instances
    expect(samurai1.primaryWeapon.use()).not.to.eql(
      samurai1.secondaryWeapon.use(),
    );

    // Shuriken should be one shared instance because scope is request scope
    expect(samurai1.secondaryWeapon.use()).to.eql(
      samurai1.tertiaryWeapon.use(),
    );

    // Katana and Shuriken are two instances
    expect(samurai2.primaryWeapon.use()).not.to.eql(
      samurai2.secondaryWeapon.use(),
    );

    // Shuriken should be one shared instance because scope is request scope
    expect(samurai2.secondaryWeapon.use()).to.eql(
      samurai2.tertiaryWeapon.use(),
    );

    // Two request should use one instances of Katana
    // for each instance of Samurai because scope is request scope
    expect(samurai1.secondaryWeapon.use()).not.to.eql(
      samurai2.secondaryWeapon.use(),
    );
    expect(samurai1.tertiaryWeapon.use()).not.to.eql(
      samurai2.tertiaryWeapon.use(),
    );
  });
});
