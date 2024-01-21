import { expect } from 'chai';
import { Container, injectable } from '../../src/inversify';

describe('Provider', () => {

  it('Should support complex asynchronous initialization processes', (done) => {

    @injectable()
    class Ninja {
      public level: number;
      public rank: string;
      public constructor() {
        this.level = 0;
        this.rank = 'Ninja';
      }
      public train(): Promise<number> {
        return new Promise<number>((resolve) => {
          setTimeout(() => {
            this.level += 10;
            resolve(this.level);
          }, 10);
        });
      }
    }

    @injectable()
    class NinjaMaster {
      public rank: string;
      public constructor() {
        this.rank = 'NinjaMaster';
      }
    }

    type NinjaMasterProvider = () => Promise<NinjaMaster>;

    const container = new Container();

    container.bind<Ninja>('Ninja').to(Ninja).inSingletonScope();
    container.bind<NinjaMasterProvider>('Provider<NinjaMaster>').toProvider((context) =>
      () =>
        new Promise<NinjaMaster>((resolve, reject) => {
          const ninja = context.container.get<Ninja>('Ninja');
          ninja.train().then((level) => {
            if (level >= 20) {
              resolve(new NinjaMaster());
            } else {
              reject('Not enough training');
            }
          });
        }));

    const ninjaMasterProvider = container.get<NinjaMasterProvider>('Provider<NinjaMaster>');

    // helper
    function valueOrDefault<T>(provider: () => Promise<T>, defaultValue: T) {
      return new Promise<T>((resolve, reject) => {
        provider().then((value) => {
          resolve(value);
        }).catch(() => {
          resolve(defaultValue);
        });
      });
    }

    valueOrDefault(ninjaMasterProvider, { rank: 'DefaultNinjaMaster' }).then((ninjaMaster) => {
      expect(ninjaMaster.rank).to.eql('DefaultNinjaMaster');
    });

    valueOrDefault(ninjaMasterProvider, { rank: 'DefaultNinjaMaster' }).then((ninjaMaster) => {
      expect(ninjaMaster.rank).to.eql('NinjaMaster');
      done();
    });

  });

  it('Should support custom arguments', (done) => {

    const container = new Container();

    interface Sword {
      material: string;
      damage: number;
    }

    @injectable()
    class Katana implements Sword {
      public material!: string;
      public damage!: number;
    }

    type SwordProvider = (material: string, damage: number) => Promise<Sword>;

    container.bind<Sword>('Sword').to(Katana);

    container.bind<SwordProvider>('SwordProvider').toProvider<Sword>((context) =>
      (material: string, damage: number) =>
        new Promise<Sword>((resolve) => {
          setTimeout(() => {
            const katana = context.container.get<Sword>('Sword');
            katana.material = material;
            katana.damage = damage;
            resolve(katana);
          }, 10);
        }));

    const katanaProvider = container.get<SwordProvider>('SwordProvider');

    katanaProvider('gold', 100).then((powerfulGoldKatana) => {

      expect(powerfulGoldKatana.material).to.eql('gold');
      expect(powerfulGoldKatana.damage).to.eql(100);

      katanaProvider('gold', 10).then((notSoPowerfulGoldKatana) => {
        expect(notSoPowerfulGoldKatana.material).to.eql('gold');
        expect(notSoPowerfulGoldKatana.damage).to.eql(10);
        done();
      });

    });

  });

  it('Should support partial application of custom arguments', (done) => {

    const container = new Container();

    interface Sword {
      material: string;
      damage: number;
    }

    @injectable()
    class Katana implements Sword {
      public material!: string;
      public damage!: number;
    }

    type SwordProvider = (material: string) => (damage: number) => Promise<Sword>;

    container.bind<Sword>('Sword').to(Katana);

    container.bind<SwordProvider>('SwordProvider').toProvider<Sword>((context) =>
      (material: string) =>
        (damage: number) =>
          new Promise<Sword>((resolve) => {
            setTimeout(() => {
              const katana = context.container.get<Sword>('Sword');
              katana.material = material;
              katana.damage = damage;
              resolve(katana);
            }, 10);
          }));

    const katanaProvider = container.get<SwordProvider>('SwordProvider');
    const goldKatanaProvider = katanaProvider('gold');

    goldKatanaProvider(100).then((powerfulGoldKatana) => {

      expect(powerfulGoldKatana.material).to.eql('gold');
      expect(powerfulGoldKatana.damage).to.eql(100);

      goldKatanaProvider(10).then((notSoPowerfulGoldKatana) => {
        expect(notSoPowerfulGoldKatana.material).to.eql('gold');
        expect(notSoPowerfulGoldKatana.damage).to.eql(10);
        done();
      });

    });

  });

  it('Should support the declaration of singletons', (done) => {

    const container = new Container();

    interface Warrior {
      level: number;
    }

    @injectable()
    class Ninja implements Warrior {
      public level: number;
      public constructor() {
        this.level = 0;
      }
    }

    type WarriorProvider = (level: number) => Promise<Warrior>;

    container.bind<Warrior>('Warrior').to(Ninja).inSingletonScope(); // Value is singleton!

    container.bind<WarriorProvider>('WarriorProvider').toProvider<Warrior>((context) =>
      (increaseLevel: number) =>
        new Promise<Warrior>((resolve) => {
          setTimeout(() => {
            const warrior = context.container.get<Warrior>('Warrior'); // Get singleton!
            warrior.level += increaseLevel;
            resolve(warrior);
          }, 100);
        }));

    const warriorProvider = container.get<WarriorProvider>('WarriorProvider');

    warriorProvider(10).then((warrior) => {

      expect(warrior.level).to.eql(10);

      warriorProvider(10).then((warrior2) => {
        expect(warrior.level).to.eql(20);
        done();
      });

    });

  });

});