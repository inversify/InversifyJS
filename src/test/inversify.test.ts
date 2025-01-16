import { expect } from 'chai';

import {
  BindingMetadata,
  Container,
  ContainerModule,
  ContainerModuleLoadOptions,
  decorate,
  Factory,
  inject,
  injectable,
  LazyServiceIdentifier,
  multiInject,
  named,
  Newable,
  ResolutionContext,
  tagged,
  unmanaged,
} from '..';

describe('InversifyJS', () => {
  it('Should be able to resolve and inject dependencies', () => {
    interface NinjaInterface {
      fight(): string;
      sneak(): string;
    }

    interface KatanaInterface {
      hit(): string;
    }

    interface ShurikenInterface {
      throw(): string;
    }

    @injectable()
    class Katana implements KatanaInterface {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class Shuriken implements ShurikenInterface {
      public throw() {
        return 'hit!';
      }
    }

    @injectable()
    class Ninja implements NinjaInterface {
      private readonly _katana: KatanaInterface;
      private readonly _shuriken: ShurikenInterface;

      constructor(
        @inject('Katana') katana: KatanaInterface,
        @inject('Shuriken') shuriken: ShurikenInterface,
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind<NinjaInterface>('Ninja').to(Ninja);
    container.bind<KatanaInterface>('Katana').to(Katana);
    container.bind<ShurikenInterface>('Shuriken').to(Shuriken);

    const ninja: NinjaInterface = container.get('Ninja');

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');
  });

  it('Should be able to do setter injection and property injection', () => {
    @injectable()
    class Shuriken {
      public throw() {
        return 'hit!';
      }
    }
    @injectable()
    class Katana implements Katana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class Ninja {
      @inject(Katana)
      public katana!: Katana;

      private _shuriken!: Shuriken;
      @inject(Shuriken)
      public set Shuriken(shuriken: Shuriken) {
        this._shuriken = shuriken;
      }

      public sneak() {
        return this._shuriken.throw();
      }
      public fight() {
        return this.katana.hit();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>('Ninja').to(Ninja);
    container.bind(Shuriken).toSelf();
    container.bind(Katana).toSelf();

    const ninja: Ninja = container.get<Ninja>('Ninja');
    expect(ninja.sneak()).to.eql('hit!');
    expect(ninja.fight()).to.eql('cut!');
  });

  it('Should be able to resolve and inject dependencies in VanillaJS', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Blowgun: 'Blowgun',
      Katana: 'Katana',
      Ninja: 'Ninja',
      Shuriken: 'Shuriken',
    };

    class Blowgun {
      public blow() {
        return 'poison!';
      }
    }

    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    class Shuriken {
      public throw() {
        return 'hit!';
      }
    }

    class Ninja {
      public _katana: Katana;
      public _shuriken: Shuriken;
      public _blowgun!: Blowgun;

      constructor(katana: Katana, shuriken: Shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public set blowgun(blowgun: Blowgun) {
        this._blowgun = blowgun;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
      public poisonDart() {
        return this._blowgun.blow();
      }
    }

    decorate([injectable()], Katana);
    decorate([injectable()], Shuriken);
    decorate([injectable()], Ninja);
    decorate([injectable()], Blowgun);
    decorate([inject(TYPES.Katana)], Ninja, 0);
    decorate([inject(TYPES.Shuriken)], Ninja, 1);
    decorate([inject(TYPES.Blowgun)], Ninja, 'blowgun');

    const container: Container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(Ninja);
    container.bind<Katana>(TYPES.Katana).to(Katana);
    container.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);
    container.bind<Blowgun>(TYPES.Blowgun).to(Blowgun);

    const ninja: Ninja = container.get(TYPES.Ninja);

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');
    expect(ninja.poisonDart()).eql('poison!');
  });

  it('Should be able to use classes as runtime identifiers', () => {
    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class Shuriken {
      public throw() {
        return 'hit!';
      }
    }

    @injectable()
    class Ninja {
      private readonly _katana: Katana;
      private readonly _shuriken: Shuriken;

      constructor(katana: Katana, shuriken: Shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>(Ninja).to(Ninja);
    container.bind<Katana>(Katana).to(Katana);
    container.bind<Shuriken>(Shuriken).to(Shuriken);

    const ninja: Ninja = container.get<Ninja>(Ninja);

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');
  });

  it('Should be able to use Symbols as runtime identifiers', () => {
    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class Shuriken {
      public throw() {
        return 'hit!';
      }
    }

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Katana: Symbol.for('Katana'),
      Ninja: Symbol.for('Ninja'),
      Shuriken: Symbol.for('Shuriken'),
    };

    @injectable()
    class Ninja {
      private readonly _katana: Katana;
      private readonly _shuriken: Shuriken;

      constructor(
        @inject(TYPES.Katana) katana: Katana,
        @inject(TYPES.Shuriken) shuriken: Shuriken,
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(Ninja);
    container.bind<Katana>(TYPES.Katana).to(Katana);
    container.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);

    const ninja: Ninja = container.get(TYPES.Ninja);

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');
  });

  it('Should be able to wrap Symbols with LazyServiceIdentifier', () => {
    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class Shuriken {
      public throw() {
        return 'hit!';
      }
    }

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Katana: Symbol.for('Katana'),
      Ninja: Symbol.for('Ninja'),
      Shuriken: Symbol.for('Shuriken'),
    };

    @injectable()
    class Ninja implements Ninja {
      private readonly _katana: Katana;
      private readonly _shuriken: Shuriken;

      constructor(
        @inject(new LazyServiceIdentifier(() => TYPES.Katana)) katana: Katana,
        @inject(new LazyServiceIdentifier(() => TYPES.Shuriken))
        shuriken: Shuriken,
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(Ninja);
    container.bind<Katana>(TYPES.Katana).to(Katana);
    container.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);

    const ninja: Ninja = container.get<Ninja>(TYPES.Ninja);

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');
  });

  it('Should support Container modules', async () => {
    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class Shuriken {
      public throw() {
        return 'hit!';
      }
    }

    @injectable()
    class Ninja {
      private readonly _katana: Katana;
      private readonly _shuriken: Shuriken;

      constructor(
        @inject('Katana') katana: Katana,
        @inject('Shuriken') shuriken: Shuriken,
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const warriors: ContainerModule = new ContainerModule(
      (options: ContainerModuleLoadOptions) => {
        options.bind<Ninja>('Ninja').to(Ninja);
      },
    );

    const weapons: ContainerModule = new ContainerModule(
      (options: ContainerModuleLoadOptions) => {
        options.bind<Katana>('Katana').to(Katana);
        options.bind<Shuriken>('Shuriken').to(Shuriken);
      },
    );

    const container: Container = new Container();

    // load
    await container.load(warriors, weapons);

    const ninja: Ninja = container.get('Ninja');

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');

    const tryGetNinja: () => void = () => {
      container.get('Ninja');
    };
    const tryGetKatana: () => void = () => {
      container.get('Katana');
    };
    const tryGetShuruken: () => void = () => {
      container.get('Shuriken');
    };

    // unload
    await container.unload(warriors);
    expect(tryGetNinja).to.throw('');
    expect(tryGetKatana).not.to.throw();
    expect(tryGetShuruken).not.to.throw();

    await container.unload(weapons);
    expect(tryGetNinja).to.throw('');
    expect(tryGetKatana).to.throw('');
    expect(tryGetShuruken).to.throw('');
  });

  it('Should support control over the scope of the dependencies', () => {
    @injectable()
    class Katana {
      private _usageCount: number;
      constructor() {
        this._usageCount = 0;
      }
      public hit() {
        this._usageCount = this._usageCount + 1;
        return `This katana was used ${this._usageCount.toString()} times!`;
      }
    }

    @injectable()
    class Shuriken {
      private _shurikenCount: number;
      constructor() {
        this._shurikenCount = 10;
      }
      public throw() {
        this._shurikenCount = this._shurikenCount - 1;
        return `Only ${this._shurikenCount.toString()} items left!`;
      }
    }

    @injectable()
    class Ninja {
      private readonly _katana: Katana;
      private readonly _shuriken: Shuriken;

      constructor(
        @inject('Katana') katana: Katana,
        @inject('Shuriken') shuriken: Shuriken,
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>('Ninja').to(Ninja);
    container.bind<Katana>('Katana').to(Katana).inSingletonScope();
    container.bind<Shuriken>('Shuriken').to(Shuriken);

    const ninja1: Ninja = container.get('Ninja');
    expect(ninja1.fight()).eql('This katana was used 1 times!');
    expect(ninja1.fight()).eql('This katana was used 2 times!');
    expect(ninja1.sneak()).eql('Only 9 items left!');
    expect(ninja1.sneak()).eql('Only 8 items left!');

    const ninja2: Ninja = container.get('Ninja');
    expect(ninja2.fight()).eql('This katana was used 3 times!');
    expect(ninja2.sneak()).eql('Only 9 items left!');
  });

  it('Should support the injection of classes to itself', () => {
    const heroName: string = 'superman';

    @injectable()
    class Hero {
      public name: string;
      constructor() {
        this.name = heroName;
      }
    }

    const container: Container = new Container();
    container.bind(Hero).toSelf();
    const hero: Hero = container.get(Hero);

    expect(hero.name).eql(heroName);
  });

  it('Should support the injection of constant values', () => {
    interface Warrior {
      name: string;
    }

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Warrior: 'Warrior',
    };

    const heroName: string = 'superman';

    @injectable()
    class Hero implements Warrior {
      public name: string;
      constructor() {
        this.name = heroName;
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>(TYPES.Warrior).toConstantValue(new Hero());
    const hero: Warrior = container.get(TYPES.Warrior);

    expect(hero.name).eql(heroName);
  });

  it('Should support the injection of dynamic values', async () => {
    @injectable()
    class UseSymbol {
      public currentSymbol: symbol;
      constructor(@inject('Symbol') currentDate: symbol) {
        this.currentSymbol = currentDate;
      }
      public doSomething() {
        return this.currentSymbol;
      }
    }

    const container: Container = new Container();
    container.bind<UseSymbol>('UseSymbol').to(UseSymbol);
    container
      .bind<symbol>('Symbol')
      .toDynamicValue((_context: ResolutionContext) => Symbol());

    const subject1: UseSymbol = container.get('UseSymbol');
    const subject2: UseSymbol = container.get('UseSymbol');
    expect(subject1.doSomething() === subject2.doSomething()).eql(false);

    await container.unbind('Symbol');
    container.bind<symbol>('Symbol').toConstantValue(Symbol());

    const subject3: UseSymbol = container.get('UseSymbol');
    const subject4: UseSymbol = container.get('UseSymbol');
    expect(subject3.doSomething() === subject4.doSomething()).eql(true);
  });

  it('Should support the injection of Functions', () => {
    const ninjaId: string = 'Ninja';
    const longDistanceWeaponId: string = 'LongDistanceWeapon';
    const shortDistanceWeaponFactoryId: string = 'ShortDistanceWeaponFactory';

    type ShortDistanceWeaponFactory = () => ShortDistanceWeapon;

    @injectable()
    class KatanaBlade {}

    @injectable()
    class KatanaHandler {}

    interface ShortDistanceWeapon {
      handler: KatanaHandler;
      blade: KatanaBlade;
    }

    @injectable()
    class Katana implements ShortDistanceWeapon {
      public handler: KatanaHandler;
      public blade: KatanaBlade;
      constructor(handler: KatanaHandler, blade: KatanaBlade) {
        this.handler = handler;
        this.blade = blade;
      }
    }

    @injectable()
    class Shuriken {}

    interface Warrior {
      shortDistanceWeaponFactory: ShortDistanceWeaponFactory;
      longDistanceWeapon: Shuriken;
    }

    @injectable()
    class Ninja implements Warrior {
      public shortDistanceWeaponFactory: ShortDistanceWeaponFactory;
      public longDistanceWeapon: Shuriken;
      constructor(
        @inject(shortDistanceWeaponFactoryId)
        shortDistanceWeaponFactory: ShortDistanceWeaponFactory,
        @inject(longDistanceWeaponId)
        longDistanceWeapon: Shuriken,
      ) {
        this.shortDistanceWeaponFactory = shortDistanceWeaponFactory;
        this.longDistanceWeapon = longDistanceWeapon;
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Shuriken>(longDistanceWeaponId).to(Shuriken);

    const katanaFactory: () => Katana = function () {
      return new Katana(new KatanaHandler(), new KatanaBlade());
    };

    container
      .bind<ShortDistanceWeaponFactory>(shortDistanceWeaponFactoryId)
      .toConstantValue(katanaFactory);
    const ninja: Ninja = container.get<Ninja>(ninjaId);

    expect(ninja instanceof Ninja).eql(true);
    expect(typeof ninja.shortDistanceWeaponFactory === 'function').eql(true);
    expect(ninja.shortDistanceWeaponFactory() instanceof Katana).eql(true);
    expect(
      ninja.shortDistanceWeaponFactory().handler instanceof KatanaHandler,
    ).eql(true);
    expect(ninja.shortDistanceWeaponFactory().blade instanceof KatanaBlade).eql(
      true,
    );
    expect(ninja.longDistanceWeapon instanceof Shuriken).eql(true);
  });

  it('Should support the injection of class constructors', () => {
    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class Ninja {
      private readonly _katana: Katana;

      constructor(@inject('Newable<Katana>') katana: Newable<Katana>) {
        this._katana = new katana();
      }

      public fight() {
        return this._katana.hit();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>('Ninja').to(Ninja);
    container.bind<Newable<Katana>>('Newable<Katana>').toConstantValue(Katana);

    const ninja: Ninja = container.get<Ninja>('Ninja');

    expect(ninja.fight()).eql('cut!');
  });

  it('Should support the injection of user defined factories', () => {
    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class Shuriken implements Shuriken {
      public throw() {
        return 'hit!';
      }
    }

    @injectable()
    class NinjaWithUserDefinedFactory implements Ninja {
      private readonly _katana: Katana;
      private readonly _shuriken: Shuriken;

      constructor(
        @inject('Factory<Katana>') katanaFactory: () => Katana,
        @inject('Shuriken') shuriken: Shuriken,
      ) {
        this._katana = katanaFactory();
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>('Ninja').to(NinjaWithUserDefinedFactory);
    container.bind<Shuriken>('Shuriken').to(Shuriken);
    container.bind<Katana>('Katana').to(Katana);
    container
      .bind<Factory<Katana>>('Factory<Katana>')
      .toFactory(
        (context: ResolutionContext) => () => context.get<Katana>('Katana'),
      );

    const ninja: Ninja = container.get<Ninja>('Ninja');

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');
  });

  it('Should support the injection of user defined factories with args', () => {
    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Weapon {
      use(): string;
    }

    @injectable()
    class Katana implements Weapon {
      public use() {
        return 'katana!';
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public use() {
        return 'shuriken!';
      }
    }

    @injectable()
    class NinjaWithUserDefinedFactory implements Ninja {
      private readonly _katana: Weapon;
      private readonly _shuriken: Weapon;

      constructor(
        @inject('Factory<Weapon>')
        weaponFactory: (throwable: boolean) => Weapon,
      ) {
        this._katana = weaponFactory(false);
        this._shuriken = weaponFactory(true);
      }

      public fight() {
        return this._katana.use();
      }
      public sneak() {
        return this._shuriken.use();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>('Ninja').to(NinjaWithUserDefinedFactory);
    container.bind<Weapon>('Weapon').to(Shuriken).whenTagged('throwable', true);
    container.bind<Weapon>('Weapon').to(Katana).whenTagged('throwable', false);

    container.bind<Factory<Weapon>>('Factory<Weapon>').toFactory(
      (context: ResolutionContext) => (throwable: boolean) =>
        context.get<Weapon>('Weapon', {
          tag: {
            key: 'throwable',
            value: throwable,
          },
        }),
    );

    const ninja: Ninja = container.get<Ninja>('Ninja');

    expect(ninja.fight()).eql('katana!');
    expect(ninja.sneak()).eql('shuriken!');
  });

  it('Should support the injection of user defined factories with partial application', () => {
    @injectable()
    class InjectorPump {}

    @injectable()
    class SparkPlugs {}

    class Engine {
      public displacement!: number | null;
    }

    @injectable()
    class DieselEngine implements Engine {
      public displacement: number | null;
      private readonly _injectorPump: InjectorPump;
      constructor(@inject('InjectorPump') injectorPump: InjectorPump) {
        this._injectorPump = injectorPump;
        this.displacement = null;
      }
      public debug() {
        return this._injectorPump;
      }
    }

    @injectable()
    class PetrolEngine implements Engine {
      public displacement: number | null;
      private readonly _sparkPlugs: SparkPlugs;
      constructor(@inject('SparkPlugs') sparkPlugs: SparkPlugs) {
        this._sparkPlugs = sparkPlugs;
        this.displacement = null;
      }
      public debug() {
        return this._sparkPlugs;
      }
    }

    interface CarFactory {
      createEngine(displacement: number): Engine;
    }

    @injectable()
    class DieselCarFactory implements CarFactory {
      private readonly _dieselFactory: (displacement: number) => Engine;
      constructor(
        @inject('Factory<Engine>')
        factory: (category: string) => (displacement: number) => Engine,
      ) {
        this._dieselFactory = factory('diesel');
      }
      public createEngine(displacement: number): Engine {
        return this._dieselFactory(displacement);
      }
    }

    const container: Container = new Container();
    container.bind<SparkPlugs>('SparkPlugs').to(SparkPlugs);
    container.bind<InjectorPump>('InjectorPump').to(InjectorPump);
    container.bind<Engine>('Engine').to(PetrolEngine).whenNamed('petrol');
    container.bind<Engine>('Engine').to(DieselEngine).whenNamed('diesel');

    container
      .bind<Factory<(displacement: number) => Engine>>('Factory<Engine>')
      .toFactory(
        (context: ResolutionContext) =>
          (theNamed: string) =>
          (displacement: number) => {
            const theEngine: Engine = context.get<Engine>('Engine', {
              name: theNamed,
            });
            theEngine.displacement = displacement;
            return theEngine;
          },
      );

    container.bind<CarFactory>('DieselCarFactory').to(DieselCarFactory);

    const dieselCarFactory: CarFactory =
      container.get<CarFactory>('DieselCarFactory');
    const engine: Engine = dieselCarFactory.createEngine(300);

    expect(engine.displacement).eql(300);
    expect(engine instanceof DieselEngine).eql(true);
  });

  it('Should support the injection of providers', (done: Mocha.Done) => {
    type KatanaProvider = () => Promise<Katana>;

    interface Ninja {
      katana: Katana | null;
      katanaProvider: KatanaProvider;
    }

    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class NinjaWithProvider implements Ninja {
      public katana: Katana | null;
      public katanaProvider: KatanaProvider;

      constructor(@inject('Provider<Katana>') katanaProvider: KatanaProvider) {
        this.katanaProvider = katanaProvider;
        this.katana = null;
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>('Ninja').to(NinjaWithProvider);
    container.bind<Katana>('Katana').to(Katana);

    container.bind<KatanaProvider>('Provider<Katana>').toProvider(
      (context: ResolutionContext) => async () =>
        new Promise<Katana>((resolve: (value: Katana) => void) => {
          const katana: Katana = context.get<Katana>('Katana');
          resolve(katana);
        }),
    );

    const ninja: Ninja = container.get<Ninja>('Ninja');

    ninja
      .katanaProvider()
      .then((katana: Katana) => {
        ninja.katana = katana;
        expect(ninja.katana.hit()).eql('cut!');
        done();
      })
      .catch((_e: unknown) => {
        /* do nothing */
      });
  });

  describe('Injection of multiple values with string as keys', () => {
    it('Should support the injection of multiple values', () => {
      const warriorId: string = 'Warrior';
      const weaponId: string = 'Weapon';

      interface Weapon {
        name: string;
      }

      @injectable()
      class Katana implements Weapon {
        public name: string = 'Katana';
      }

      @injectable()
      class Shuriken implements Weapon {
        public name: string = 'Shuriken';
      }

      interface Warrior {
        katana: Weapon;
        shuriken: Weapon;
      }

      @injectable()
      class Ninja implements Warrior {
        public katana: Weapon;
        public shuriken: Weapon;
        constructor(@multiInject(weaponId) weapons: Weapon[]) {
          this.katana = weapons[0] as Weapon;
          this.shuriken = weapons[1] as Weapon;
        }
      }

      const container: Container = new Container();
      container.bind<Warrior>(warriorId).to(Ninja);
      container.bind<Weapon>(weaponId).to(Katana);
      container.bind<Weapon>(weaponId).to(Shuriken);

      const ninja: Warrior = container.get<Warrior>(warriorId);
      expect(ninja.katana.name).eql('Katana');
      expect(ninja.shuriken.name).eql('Shuriken');

      // if only one value is bound to Weapon
      const container2: Container = new Container();
      container2.bind<Warrior>(warriorId).to(Ninja);
      container2.bind<Weapon>(weaponId).to(Katana);

      const ninja2: Ninja = container2.get<Warrior>(warriorId);
      expect(ninja2.katana.name).eql('Katana');
    });

    it('Should support the injection of multiple values with nested inject', () => {
      @injectable()
      class Katana {
        public hit() {
          return 'cut!';
        }
      }

      @injectable()
      class Shuriken {
        public throw() {
          return 'hit!';
        }
      }

      @injectable()
      class Ninja {
        private readonly _katana: Katana;
        private readonly _shuriken: Shuriken;

        constructor(
          @inject('Katana') katana: Katana,
          @inject('Shuriken') shuriken: Shuriken,
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      interface School {
        ninjaMaster: Ninja;
        student: Ninja;
      }

      @injectable()
      class NinjaSchool implements School {
        public ninjaMaster: Ninja;
        public student: Ninja;

        constructor(@multiInject('Ninja') ninja: Ninja[]) {
          this.ninjaMaster = ninja[0] as Ninja;
          this.student = ninja[1] as Ninja;
        }
      }

      const container: Container = new Container();
      container.bind<Katana>('Katana').to(Katana);
      container.bind<Shuriken>('Shuriken').to(Shuriken);
      container.bind<Ninja>('Ninja').to(Ninja);
      container.bind<Ninja>('Ninja').to(Ninja);
      container.bind<School>('School').to(NinjaSchool);

      const ninjaSchool: School = container.get<School>('School');
      expect(ninjaSchool.ninjaMaster.fight()).eql('cut!');
      expect(ninjaSchool.ninjaMaster.sneak()).eql('hit!');

      expect(ninjaSchool.student.fight()).eql('cut!');
      expect(ninjaSchool.student.sneak()).eql('hit!');
    });

    it('Should support the injection of multiple values with nested multiInject', () => {
      const warriorId: string = 'Warrior';
      const swordId: string = 'Sword';
      const shurikenId: string = 'Shuriken';
      const schoolId: string = 'School';
      const organisationId: string = 'Organisation';

      interface Warrior {
        fight(): string;
        sneak(): string;
      }

      interface Sword {
        hit(): string;
      }

      @injectable()
      class Katana implements Sword {
        public hit() {
          return 'cut!';
        }
      }

      @injectable()
      class Shuriken {
        public throw() {
          return 'hit!';
        }
      }

      @injectable()
      class Ninja implements Warrior {
        private readonly _katana: Sword;
        private readonly _shuriken: Shuriken;

        constructor(
          @inject(swordId) katana: Sword,
          @inject(shurikenId) shuriken: Shuriken,
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      interface School {
        ninjaMaster: Warrior;
        student: Warrior;
      }

      @injectable()
      class NinjaSchool implements School {
        public ninjaMaster: Warrior;
        public student: Warrior;

        constructor(@multiInject(warriorId) ninjas: Ninja[]) {
          this.ninjaMaster = ninjas[0] as Ninja;
          this.student = ninjas[1] as Ninja;
        }
      }

      interface Organisation {
        schools: School[];
      }

      @injectable()
      class NinjaOrganisation implements Organisation {
        public schools: School[];

        constructor(@multiInject(schoolId) schools: School[]) {
          this.schools = schools;
        }
      }

      const container: Container = new Container();
      container.bind<Sword>(swordId).to(Katana);
      container.bind<Shuriken>(shurikenId).to(Shuriken);
      container.bind<Warrior>(warriorId).to(Ninja);
      container.bind<Warrior>(warriorId).to(Ninja);
      container.bind<School>(schoolId).to(NinjaSchool);
      container.bind<School>(schoolId).to(NinjaSchool);
      container.bind<Organisation>(organisationId).to(NinjaOrganisation);

      const ninjaOrganisation: Organisation =
        container.get<Organisation>(organisationId);

      for (let i: number = 0; i < 2; i++) {
        const ithNinjaOrganizationSchool: School = ninjaOrganisation.schools[
          i
        ] as School;

        expect(ithNinjaOrganizationSchool.ninjaMaster.fight()).eql('cut!');
        expect(ithNinjaOrganizationSchool.ninjaMaster.sneak()).eql('hit!');
        expect(ithNinjaOrganizationSchool.student.fight()).eql('cut!');
        expect(ithNinjaOrganizationSchool.student.sneak()).eql('hit!');
      }
    });
  });

  describe('Injection of multiple values with class as keys', () => {
    it('Should support the injection of multiple values when using classes as keys', () => {
      @injectable()
      class Weapon {
        public name!: string;
      }

      @injectable()
      class Katana extends Weapon {
        constructor() {
          super();
          this.name = 'Katana';
        }
      }

      @injectable()
      class Shuriken extends Weapon {
        constructor() {
          super();
          this.name = 'Shuriken';
        }
      }

      @injectable()
      class Ninja {
        public katana: Weapon;
        public shuriken: Weapon;
        constructor(@multiInject(Weapon) weapons: Weapon[]) {
          this.katana = weapons[0] as Weapon;
          this.shuriken = weapons[1] as Weapon;
        }
      }

      const container: Container = new Container();
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<Weapon>(Weapon).to(Katana);
      container.bind<Weapon>(Weapon).to(Shuriken);

      const ninja: Ninja = container.get<Ninja>(Ninja);
      expect(ninja.katana.name).eql('Katana');
      expect(ninja.shuriken.name).eql('Shuriken');

      // if only one value is bound to Weapon
      const container2: Container = new Container();
      container2.bind<Ninja>(Ninja).to(Ninja);
      container2.bind<Weapon>(Weapon).to(Katana);

      const ninja2: Ninja = container2.get<Ninja>(Ninja);
      expect(ninja2.katana.name).eql('Katana');
    });

    it('Should support the injection of multiple values with nested inject', () => {
      @injectable()
      class Katana {
        public hit() {
          return 'cut!';
        }
      }

      @injectable()
      class Shuriken {
        public throw() {
          return 'hit!';
        }
      }

      @injectable()
      class Ninja {
        private readonly _katana: Katana;
        private readonly _shuriken: Shuriken;

        constructor(katana: Katana, shuriken: Shuriken) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      @injectable()
      class NinjaSchool {
        public ninjaMaster: Ninja;
        public student: Ninja;

        constructor(@multiInject(Ninja) ninja: Ninja[]) {
          this.ninjaMaster = ninja[0] as Ninja;
          this.student = ninja[1] as Ninja;
        }
      }

      const container: Container = new Container();
      container.bind<Katana>(Katana).to(Katana);
      container.bind<Shuriken>(Shuriken).to(Shuriken);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);

      const ninjaSchool: NinjaSchool = container.get<NinjaSchool>(NinjaSchool);
      expect(ninjaSchool.ninjaMaster.fight()).eql('cut!');
      expect(ninjaSchool.ninjaMaster.sneak()).eql('hit!');

      expect(ninjaSchool.student.fight()).eql('cut!');
      expect(ninjaSchool.student.sneak()).eql('hit!');
    });

    it('Should support the injection of multiple values with nested multiInject', () => {
      @injectable()
      class Katana {
        public hit() {
          return 'cut!';
        }
      }

      @injectable()
      class Shuriken {
        public throw() {
          return 'hit!';
        }
      }

      @injectable()
      class Ninja {
        private readonly _katana: Katana;
        private readonly _shuriken: Shuriken;

        constructor(katana: Katana, shuriken: Shuriken) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      @injectable()
      class NinjaSchool {
        public ninjaMaster: Ninja;
        public student: Ninja;

        constructor(@multiInject(Ninja) ninjas: Ninja[]) {
          this.ninjaMaster = ninjas[0] as Ninja;
          this.student = ninjas[1] as Ninja;
        }
      }

      @injectable()
      class NinjaOrganisation {
        public schools: NinjaSchool[];

        constructor(@multiInject(NinjaSchool) schools: NinjaSchool[]) {
          this.schools = schools;
        }
      }

      const container: Container = new Container();
      container.bind<Katana>(Katana).to(Katana);
      container.bind<Shuriken>(Shuriken).to(Shuriken);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);
      container.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);
      container
        .bind<NinjaOrganisation>(NinjaOrganisation)
        .to(NinjaOrganisation);

      const ninjaOrganisation: NinjaOrganisation =
        container.get<NinjaOrganisation>(NinjaOrganisation);

      for (let i: number = 0; i < 2; i++) {
        const ithNinjaOrganizationSchool: NinjaSchool = ninjaOrganisation
          .schools[i] as NinjaSchool;

        expect(ithNinjaOrganizationSchool.ninjaMaster.fight()).eql('cut!');
        expect(ithNinjaOrganizationSchool.ninjaMaster.sneak()).eql('hit!');
        expect(ithNinjaOrganizationSchool.student.fight()).eql('cut!');
        expect(ithNinjaOrganizationSchool.student.sneak()).eql('hit!');
      }
    });
  });

  describe('Injection of multiple values with Symbol as keys', () => {
    it('Should support the injection of multiple values when using Symbols as keys', () => {
      // eslint-disable-next-line @typescript-eslint/typedef
      const TYPES = {
        Warrior: Symbol.for('Warrior'),
        Weapon: Symbol.for('Weapon'),
      };

      interface Weapon {
        name: string;
      }

      @injectable()
      class Katana implements Weapon {
        public name: string = 'Katana';
      }

      @injectable()
      class Shuriken implements Weapon {
        public name: string = 'Shuriken';
      }

      interface Warrior {
        katana: Weapon;
        shuriken: Weapon;
      }

      @injectable()
      class Ninja implements Warrior {
        public katana: Weapon;
        public shuriken: Weapon;
        constructor(@multiInject(TYPES.Weapon) weapons: Weapon[]) {
          this.katana = weapons[0] as Weapon;
          this.shuriken = weapons[1] as Weapon;
        }
      }

      const container: Container = new Container();
      container.bind<Warrior>(TYPES.Warrior).to(Ninja);
      container.bind<Weapon>(TYPES.Weapon).to(Katana);
      container.bind<Weapon>(TYPES.Weapon).to(Shuriken);

      const ninja: Ninja = container.get<Warrior>(TYPES.Warrior);
      expect(ninja.katana.name).eql('Katana');
      expect(ninja.shuriken.name).eql('Shuriken');

      // if only one value is bound to Weapon
      const container2: Container = new Container();
      container2.bind<Warrior>(TYPES.Warrior).to(Ninja);
      container2.bind<Weapon>(TYPES.Weapon).to(Katana);

      const ninja2: Ninja = container2.get<Warrior>(TYPES.Warrior);
      expect(ninja2.katana.name).eql('Katana');
    });

    it('Should support the injection of multiple values with nested inject', () => {
      // eslint-disable-next-line @typescript-eslint/typedef
      const TYPES = {
        Katana: Symbol.for('Katana'),
        Ninja: Symbol.for('Ninja'),
        School: Symbol.for('School'),
        Shuriken: Symbol.for('Shuriken'),
      };

      @injectable()
      class Katana {
        public hit() {
          return 'cut!';
        }
      }

      @injectable()
      class Shuriken {
        public throw() {
          return 'hit!';
        }
      }

      @injectable()
      class Ninja {
        private readonly _katana: Katana;
        private readonly _shuriken: Shuriken;

        constructor(
          @inject(TYPES.Katana) katana: Katana,
          @inject(TYPES.Shuriken) shuriken: Shuriken,
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      interface School {
        ninjaMaster: Ninja;
        student: Ninja;
      }

      @injectable()
      class NinjaSchool implements School {
        public ninjaMaster: Ninja;
        public student: Ninja;

        constructor(@multiInject(TYPES.Ninja) ninja: Ninja[]) {
          this.ninjaMaster = ninja[0] as Ninja;
          this.student = ninja[1] as Ninja;
        }
      }

      const container: Container = new Container();
      container.bind<Katana>(TYPES.Katana).to(Katana);
      container.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);
      container.bind<Ninja>(TYPES.Ninja).to(Ninja);
      container.bind<Ninja>(TYPES.Ninja).to(Ninja);
      container.bind<School>(TYPES.School).to(NinjaSchool);

      const ninjaSchool: School = container.get<School>(TYPES.School);
      expect(ninjaSchool.ninjaMaster.fight()).eql('cut!');
      expect(ninjaSchool.ninjaMaster.sneak()).eql('hit!');

      expect(ninjaSchool.student.fight()).eql('cut!');
      expect(ninjaSchool.student.sneak()).eql('hit!');
    });

    it('Should support the injection of multiple values with nested multiInject', () => {
      // eslint-disable-next-line @typescript-eslint/typedef
      const TYPES = {
        Katana: Symbol.for('Katana'),
        Ninja: Symbol.for('Ninja'),
        Organisation: Symbol.for('Organisation'),
        School: Symbol.for('School'),
        Shuriken: Symbol.for('Shuriken'),
      };

      @injectable()
      class Katana {
        public hit() {
          return 'cut!';
        }
      }

      @injectable()
      class Shuriken {
        public throw() {
          return 'hit!';
        }
      }

      @injectable()
      class Ninja {
        private readonly _katana: Katana;
        private readonly _shuriken: Shuriken;

        constructor(
          @inject(TYPES.Katana) katana: Katana,
          @inject(TYPES.Shuriken) shuriken: Shuriken,
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      interface School {
        ninjaMaster: Ninja;
        student: Ninja;
      }

      @injectable()
      class NinjaSchool implements School {
        public ninjaMaster: Ninja;
        public student: Ninja;

        constructor(@multiInject(TYPES.Ninja) ninjas: Ninja[]) {
          this.ninjaMaster = ninjas[0] as Ninja;
          this.student = ninjas[1] as Ninja;
        }
      }

      interface Organisation {
        schools: NinjaSchool[];
      }

      @injectable()
      class NinjaOrganisation implements Organisation {
        public schools: NinjaSchool[];

        constructor(@multiInject(TYPES.School) schools: School[]) {
          this.schools = schools;
        }
      }

      const container: Container = new Container();
      container.bind<Katana>(TYPES.Katana).to(Katana);
      container.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);
      container.bind<Ninja>(TYPES.Ninja).to(Ninja);
      container.bind<Ninja>(TYPES.Ninja).to(Ninja);
      container.bind<School>(TYPES.School).to(NinjaSchool);
      container.bind<School>(TYPES.School).to(NinjaSchool);
      container.bind<Organisation>(TYPES.Organisation).to(NinjaOrganisation);

      const ninjaOrganisation: Organisation = container.get<Organisation>(
        TYPES.Organisation,
      );

      for (let i: number = 0; i < 2; i++) {
        const ithNinjaOrganizationSchool: School = ninjaOrganisation.schools[
          i
        ] as School;

        expect(ithNinjaOrganizationSchool.ninjaMaster.fight()).eql('cut!');
        expect(ithNinjaOrganizationSchool.ninjaMaster.sneak()).eql('hit!');
        expect(ithNinjaOrganizationSchool.student.fight()).eql('cut!');
        expect(ithNinjaOrganizationSchool.student.sneak()).eql('hit!');
      }
    });
  });

  it('Should support tagged bindings', () => {
    enum Tag {
      CanThrow,
    }

    @injectable()
    class Katana {}

    @injectable()
    class Shuriken {}

    interface Warrior {
      katana: unknown;
      shuriken: unknown;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: unknown;
      public shuriken: unknown;
      constructor(
        @inject('Weapon') @tagged('canThrow', false) katana: unknown,
        @inject('Weapon') @tagged(Tag.CanThrow, true) shuriken: unknown,
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>('Warrior').to(Ninja);
    container.bind('Weapon').to(Katana).whenTagged('canThrow', false);
    container.bind('Weapon').to(Shuriken).whenTagged(Tag.CanThrow, true);

    const ninja: Ninja = container.get<Warrior>('Warrior');
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);
  });

  it('Should support custom tag decorators', () => {
    @injectable()
    class Katana {}

    @injectable()
    class Shuriken {}

    interface Warrior {
      katana: unknown;
      shuriken: unknown;
    }

    const throwable: ParameterDecorator & PropertyDecorator = tagged(
      'canThrow',
      true,
    );
    const notThrowable: ParameterDecorator & PropertyDecorator = tagged(
      'canThrow',
      false,
    );

    @injectable()
    class Ninja implements Warrior {
      public katana: unknown;
      public shuriken: unknown;
      constructor(
        @inject('Weapon') @notThrowable katana: unknown,
        @inject('Weapon') @throwable shuriken: unknown,
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>('Warrior').to(Ninja);
    container.bind('Weapon').to(Katana).whenTagged('canThrow', false);
    container.bind('Weapon').to(Shuriken).whenTagged('canThrow', true);

    const ninja: Warrior = container.get<Warrior>('Warrior');
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);
  });

  it('Should support named bindings', () => {
    const name: symbol = Symbol.for('Weak');

    @injectable()
    class Katana {}

    @injectable()
    class Shuriken {}

    interface Warrior {
      katana: unknown;
      shuriken: unknown;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: unknown;
      public shuriken: unknown;
      constructor(
        @inject('Weapon') @named('strong') katana: unknown,
        @inject('Weapon') @named(name) shuriken: unknown,
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>('Warrior').to(Ninja);
    container.bind('Weapon').to(Katana).whenNamed('strong');
    container.bind('Weapon').to(Shuriken).whenNamed(name);

    const ninja: Warrior = container.get<Warrior>('Warrior');
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);
  });

  it('Should be able to resolve a ambiguous binding by providing a named tag', () => {
    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      constructor() {
        this.name = 'katana';
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      constructor() {
        this.name = 'shuriken';
      }
    }

    const container: Container = new Container();
    container.bind<Weapon>('Weapon').to(Katana).whenNamed('japanese');
    container.bind<Weapon>('Weapon').to(Shuriken).whenNamed('chinese');

    const katana: Weapon = container.get<Weapon>('Weapon', {
      name: 'japanese',
    });
    const shuriken: Weapon = container.get<Weapon>('Weapon', {
      name: 'chinese',
    });

    expect(katana.name).eql('katana');
    expect(shuriken.name).eql('shuriken');
  });

  it('Should be able to resolve a ambiguous binding by providing a custom tag', () => {
    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      constructor() {
        this.name = 'katana';
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      constructor() {
        this.name = 'shuriken';
      }
    }

    const container: Container = new Container();
    container
      .bind<Weapon>('Weapon')
      .to(Katana)
      .whenTagged('faction', 'samurai');
    container
      .bind<Weapon>('Weapon')
      .to(Shuriken)
      .whenTagged('faction', 'ninja');

    const katana: Weapon = container.get<Weapon>('Weapon', {
      tag: {
        key: 'faction',
        value: 'samurai',
      },
    });
    const shuriken: Weapon = container.get<Weapon>('Weapon', {
      tag: {
        key: 'faction',
        value: 'ninja',
      },
    });

    expect(katana.name).eql('katana');
    expect(shuriken.name).eql('shuriken');
  });

  it('Should be able to inject into a super constructor', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const SYMBOLS = {
      Samurai: Symbol.for('Samurai'),
      SamuraiMaster: Symbol.for('SamuraiMaster'),
      SamuraiMaster2: Symbol.for('SamuraiMaster2'),
      Weapon: Symbol.for('Weapon'),
    };

    interface Weapon {
      name: string;
    }

    interface Warrior {
      weapon: Weapon;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      constructor() {
        this.name = 'katana';
      }
    }

    @injectable()
    class Samurai implements Warrior {
      public weapon: Weapon;

      constructor(weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class SamuraiMaster extends Samurai implements Warrior {
      public isMaster: boolean;
      constructor(@inject(SYMBOLS.Weapon) weapon: Weapon) {
        super(weapon);
        this.isMaster = true;
      }
    }

    const container: Container = new Container();
    container.bind<Weapon>(SYMBOLS.Weapon).to(Katana);

    container.bind<Warrior>(SYMBOLS.SamuraiMaster2).to(SamuraiMaster);

    const samuraiMaster2: SamuraiMaster = container.get<SamuraiMaster>(
      SYMBOLS.SamuraiMaster2,
    );
    expect(samuraiMaster2.weapon.name).eql('katana');
    expect(typeof samuraiMaster2.isMaster).eql('boolean');
  });

  it('Should support a whenParentNamed contextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') @named('non-lethal') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') @named('lethal') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container.bind<Material>(TYPES.Material).to(Iron).whenParentNamed('lethal');
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenParentNamed('non-lethal');

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');
  });

  it('Should support a whenParentTagged contextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') @tagged('lethal', false) weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') @tagged('lethal', true) weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenParentTagged('lethal', true);
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenParentTagged('lethal', false);

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');
  });

  it('Should support a whenAnyAncestorIs and whenNoAncestorIs contextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    function isNinjaStudentConstraint(
      bindingMetadata: BindingMetadata,
    ): boolean {
      return (
        bindingMetadata.serviceIdentifier === TYPES.Ninja &&
        bindingMetadata.tags.get('master') === false
      );
    }

    function isNinjaMasterConstraint(
      bindingMetadata: BindingMetadata,
    ): boolean {
      return (
        bindingMetadata.serviceIdentifier === TYPES.Ninja &&
        bindingMetadata.tags.get('master') === true
      );
    }

    // whenAnyAncestorIs
    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenAnyAncestor(isNinjaMasterConstraint);
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenAnyAncestor(isNinjaStudentConstraint);

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorIs
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenNoAncestor(isNinjaStudentConstraint);
    container2
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenNoAncestor(isNinjaMasterConstraint);

    const master2: Ninja = container2.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student2: Ninja = container2.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master2.weapon.material.name).eql('iron');
    expect(student2.weapon.material.name).eql('wood');
  });

  it('Should support a whenAnyAncestorNamed and whenNoAncestorNamed contextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    // whenAnyAncestorNamed
    const container: Container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenNamed('non-lethal');
    container.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenNamed('lethal');
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenAnyAncestorNamed('lethal');
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenAnyAncestorNamed('non-lethal');

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      name: 'lethal',
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      name: 'non-lethal',
    });

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorNamed
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenNamed('non-lethal');
    container2.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenNamed('lethal');
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenNoAncestorNamed('non-lethal');
    container2
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenNoAncestorNamed('lethal');

    const master2: Ninja = container.get<Ninja>(TYPES.Ninja, {
      name: 'lethal',
    });
    const student2: Ninja = container.get<Ninja>(TYPES.Ninja, {
      name: 'non-lethal',
    });

    expect(master2.weapon.material.name).eql('iron');
    expect(student2.weapon.material.name).eql('wood');
  });

  it('Should support a whenAnyAncestorTagged and whenNoAncestorTaggedcontextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    // whenAnyAncestorTagged
    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('lethal', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('lethal', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenAnyAncestorTagged('lethal', true);
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenAnyAncestorTagged('lethal', false);

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'lethal',
        value: true,
      },
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'lethal',
        value: false,
      },
    });

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorTagged
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('lethal', false);
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('lethal', true);
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenNoAncestorTagged('lethal', false);
    container2
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenNoAncestorTagged('lethal', true);

    const master2: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'lethal',
        value: true,
      },
    });
    const student2: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'lethal',
        value: false,
      },
    });

    expect(master2.weapon.material.name).eql('iron');
    expect(student2.weapon.material.name).eql('wood');
  });

  it('Should support a whenAnyAncestorMatches and whenNoAncestorMatches contextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    // custom constraints
    function isNinjaStudentConstraint(
      bindingMetadata: BindingMetadata,
    ): boolean {
      return (
        bindingMetadata.serviceIdentifier === TYPES.Ninja &&
        bindingMetadata.tags.get('master') === false
      );
    }

    function isNinjaMasterConstraint(
      bindingMetadata: BindingMetadata,
    ): boolean {
      return (
        bindingMetadata.serviceIdentifier === TYPES.Ninja &&
        bindingMetadata.tags.get('master') === true
      );
    }

    // whenAnyAncestorMatches
    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenAnyAncestor(isNinjaMasterConstraint);
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenAnyAncestor(isNinjaStudentConstraint);

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorMatches
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenNoAncestor(isNinjaStudentConstraint);
    container2
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenNoAncestor(isNinjaMasterConstraint);

    const master2: Ninja = container2.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student2: Ninja = container2.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master2.weapon.material.name).eql('iron');
    expect(student2.weapon.material.name).eql('wood');
  });

  it('Should be able to inject a regular derived class', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const SYMBOLS = {
      RANK: Symbol.for('RANK'),
      SamuraiMaster: Symbol.for('SamuraiMaster'),
    };

    interface Warrior {
      rank: string;
    }

    @injectable()
    class Samurai implements Warrior {
      public rank: string;

      constructor(rank: string) {
        this.rank = rank;
      }
    }

    @injectable()
    class SamuraiMaster extends Samurai implements Warrior {
      constructor(@inject(SYMBOLS.RANK) rank: string) {
        super(rank);
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>(SYMBOLS.SamuraiMaster).to(SamuraiMaster);
    container.bind<string>(SYMBOLS.RANK).toConstantValue('Master');

    const samurai: SamuraiMaster = container.get<SamuraiMaster>(
      SYMBOLS.SamuraiMaster,
    );
    expect(samurai.rank).eql('Master');
  });

  it('Should not throw due to a missing @injectable in a base class', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const SYMBOLS = {
      SamuraiMaster: Symbol.for('SamuraiMaster'),
    };

    interface Warrior {
      rank: string;
    }

    // IMPORTANT: Missing @injectable()
    class Samurai implements Warrior {
      public rank: string;

      constructor(rank: string) {
        this.rank = rank;
      }
    }

    @injectable()
    class SamuraiMaster extends Samurai implements Warrior {
      constructor() {
        super('master');
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>(SYMBOLS.SamuraiMaster).to(SamuraiMaster);

    function notThrows() {
      return container.get<Warrior>(SYMBOLS.SamuraiMaster);
    }

    expect(notThrows).not.to.throw();
  });
});
