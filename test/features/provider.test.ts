import { expect } from 'chai';

import { Container, injectable, interfaces } from '../../src/index';

describe('Provider', () => {
  it('Should support complex asynchronous initialization processes', (done: Mocha.Done) => {
    @injectable()
    class Ninja {
      public level: number;
      public rank: string;
      constructor() {
        this.level = 0;
        this.rank = 'Ninja';
      }
      public async train(): Promise<number> {
        return new Promise<number>(
          (resolve: (value: number | PromiseLike<number>) => void) => {
            setTimeout(() => {
              this.level += 10;
              resolve(this.level);
            }, 10);
          },
        );
      }
    }

    @injectable()
    class NinjaMaster {
      public rank: string;
      constructor() {
        this.rank = 'NinjaMaster';
      }
    }

    type NinjaMasterProvider = () => Promise<NinjaMaster>;

    const container: Container = new Container();

    container.bind<Ninja>('Ninja').to(Ninja).inSingletonScope();
    container.bind<NinjaMasterProvider>('Provider<NinjaMaster>').toProvider(
      (context: interfaces.Context) => async () =>
        new Promise<NinjaMaster>(
          (
            resolve: (value: NinjaMaster | PromiseLike<NinjaMaster>) => void,
            reject: (reason?: unknown) => void,
          ) => {
            const ninja: Ninja = context.container.get<Ninja>('Ninja');

            void ninja.train().then((level: number) => {
              if (level >= 20) {
                resolve(new NinjaMaster());
              } else {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject('Not enough training');
              }
            });
          },
        ),
    );

    const ninjaMasterProvider: NinjaMasterProvider =
      container.get<NinjaMasterProvider>('Provider<NinjaMaster>');

    // helper
    async function valueOrDefault<T>(
      provider: () => Promise<T>,
      defaultValue: T,
    ) {
      return new Promise<T>((resolve: (value: T | PromiseLike<T>) => void) => {
        provider()
          .then((value: T) => {
            resolve(value);
          })
          .catch(() => {
            resolve(defaultValue);
          });
      });
    }

    void valueOrDefault(ninjaMasterProvider, {
      rank: 'DefaultNinjaMaster',
    }).then((ninjaMaster: NinjaMaster) => {
      expect(ninjaMaster.rank).to.eql('DefaultNinjaMaster');
    });

    void valueOrDefault(ninjaMasterProvider, {
      rank: 'DefaultNinjaMaster',
    }).then((ninjaMaster: NinjaMaster) => {
      expect(ninjaMaster.rank).to.eql('NinjaMaster');
      done();
    });
  });

  it('Should support custom arguments', (done: Mocha.Done) => {
    const container: Container = new Container();

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

    container.bind<SwordProvider>('SwordProvider').toProvider<Sword>(
      (context: interfaces.Context) =>
        async (material: string, damage: number) =>
          new Promise<Sword>(
            (resolve: (value: Sword | PromiseLike<Sword>) => void) => {
              setTimeout(() => {
                const katana: Sword = context.container.get<Sword>('Sword');
                katana.material = material;
                katana.damage = damage;
                resolve(katana);
              }, 10);
            },
          ),
    );

    const katanaProvider: SwordProvider =
      container.get<SwordProvider>('SwordProvider');

    void katanaProvider('gold', 100).then((powerfulGoldKatana: Sword) => {
      expect(powerfulGoldKatana.material).to.eql('gold');

      expect(powerfulGoldKatana.damage).to.eql(100);

      void katanaProvider('gold', 10).then((notSoPowerfulGoldKatana: Sword) => {
        expect(notSoPowerfulGoldKatana.material).to.eql('gold');

        expect(notSoPowerfulGoldKatana.damage).to.eql(10);
        done();
      });
    });
  });

  it('Should support partial application of custom arguments', (done: Mocha.Done) => {
    const container: Container = new Container();

    interface Sword {
      material: string;
      damage: number;
    }

    @injectable()
    class Katana implements Sword {
      public material!: string;
      public damage!: number;
    }

    type SwordProvider = (
      material: string,
    ) => (damage: number) => Promise<Sword>;

    container.bind<Sword>('Sword').to(Katana);

    container.bind<SwordProvider>('SwordProvider').toProvider<Sword>(
      (context: interfaces.Context) =>
        (material: string) =>
        async (damage: number) =>
          new Promise<Sword>((resolve: (value: Sword) => void) => {
            setTimeout(() => {
              const katana: Sword = context.container.get('Sword');
              katana.material = material;
              katana.damage = damage;
              resolve(katana);
            }, 10);
          }),
    );

    const katanaProvider: SwordProvider = container.get('SwordProvider');
    const goldKatanaProvider: (damage: number) => Promise<Sword> =
      katanaProvider('gold');

    void goldKatanaProvider(100).then((powerfulGoldKatana: Sword) => {
      expect(powerfulGoldKatana.material).to.eql('gold');
      expect(powerfulGoldKatana.damage).to.eql(100);

      void goldKatanaProvider(10).then((notSoPowerfulGoldKatana: Sword) => {
        expect(notSoPowerfulGoldKatana.material).to.eql('gold');
        expect(notSoPowerfulGoldKatana.damage).to.eql(10);
        done();
      });
    });
  });

  it('Should support the declaration of singletons', (done: Mocha.Done) => {
    const container: Container = new Container();

    interface Warrior {
      level: number;
    }

    @injectable()
    class Ninja implements Warrior {
      public level: number;
      constructor() {
        this.level = 0;
      }
    }

    type WarriorProvider = (level: number) => Promise<Warrior>;

    container.bind<Warrior>('Warrior').to(Ninja).inSingletonScope(); // Value is singleton!

    container.bind<WarriorProvider>('WarriorProvider').toProvider<Warrior>(
      (context: interfaces.Context) => async (increaseLevel: number) =>
        new Promise<Warrior>((resolve: (value: Warrior) => void) => {
          setTimeout(() => {
            const warrior: Warrior = context.container.get<Warrior>('Warrior');
            warrior.level += increaseLevel;
            resolve(warrior);
          }, 100);
        }),
    );

    const warriorProvider: WarriorProvider = container.get('WarriorProvider');

    void warriorProvider(10).then((warrior: Warrior) => {
      expect(warrior.level).to.eql(10);

      void warriorProvider(10).then((warrior2: Warrior) => {
        expect(warrior2.level).to.eql(20);
        done();
      });
    });
  });
});
