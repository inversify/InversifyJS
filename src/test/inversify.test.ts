/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import { expect } from 'chai';

import { DecoratorTarget } from '../annotation/decorator_utils';
import * as ERROR_MSGS from '../constants/error_msgs';
import {
  Container,
  ContainerModule,
  decorate,
  inject,
  injectable,
  LazyServiceIdentifier,
  multiInject,
  named,
  tagged,
  targetName,
  typeConstraint,
  unmanaged,
} from '../index';
import type { interfaces } from '../interfaces/interfaces';

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

    decorate(injectable(), Katana);
    decorate(injectable(), Shuriken);
    decorate(injectable(), Ninja);
    decorate(injectable(), Blowgun);
    decorate(inject(TYPES.Katana), Ninja, 0);
    decorate(inject(TYPES.Shuriken), Ninja, 1);
    decorate(inject(TYPES.Blowgun), Ninja.prototype, 'blowgun');

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

  it('Should support Container modules', () => {
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
      (bind: interfaces.Bind) => {
        bind<Ninja>('Ninja').to(Ninja);
      },
    );

    const weapons: ContainerModule = new ContainerModule(
      (bind: interfaces.Bind) => {
        bind<Katana>('Katana').to(Katana);
        bind<Shuriken>('Shuriken').to(Shuriken);
      },
    );

    const container: Container = new Container();

    // load
    container.load(warriors, weapons);

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
    container.unload(warriors);
    expect(tryGetNinja).to.throw(ERROR_MSGS.NOT_REGISTERED);
    expect(tryGetKatana).not.to.throw();
    expect(tryGetShuruken).not.to.throw();

    container.unload(weapons);
    expect(tryGetNinja).to.throw(ERROR_MSGS.NOT_REGISTERED);
    expect(tryGetKatana).to.throw(ERROR_MSGS.NOT_REGISTERED);
    expect(tryGetShuruken).to.throw(ERROR_MSGS.NOT_REGISTERED);
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

  it('Should support the injection of dynamic values', () => {
    @injectable()
    class UseDate {
      public currentDate: Date;
      constructor(@inject('Date') currentDate: Date) {
        this.currentDate = currentDate;
      }
      public doSomething() {
        return this.currentDate;
      }
    }

    const container: Container = new Container();
    container.bind<UseDate>('UseDate').to(UseDate);
    container
      .bind<Date>('Date')
      .toDynamicValue((_context: interfaces.Context) => new Date());

    const subject1: UseDate = container.get('UseDate');
    const subject2: UseDate = container.get('UseDate');
    expect(subject1.doSomething() === subject2.doSomething()).eql(false);

    container.unbind('Date');
    container.bind<Date>('Date').toConstantValue(new Date());

    const subject3: UseDate = container.get('UseDate');
    const subject4: UseDate = container.get('UseDate');
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
        @targetName('katana')
        shortDistanceWeaponFactory: ShortDistanceWeaponFactory,
        @inject(longDistanceWeaponId)
        @targetName('shuriken')
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
      .toFunction(katanaFactory);
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

      constructor(
        @inject('Newable<Katana>') katana: interfaces.Newable<Katana>,
      ) {
        this._katana = new katana();
      }

      public fight() {
        return this._katana.hit();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>('Ninja').to(Ninja);
    container
      .bind<interfaces.Newable<Katana>>('Newable<Katana>')
      .toConstructor<Katana>(Katana);

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
      .bind<interfaces.Factory<Katana>>('Factory<Katana>')
      .toFactory<Katana>(
        (context: interfaces.Context) => () =>
          context.container.get<Katana>('Katana'),
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
    container
      .bind<Weapon>('Weapon')
      .to(Shuriken)
      .whenTargetTagged('throwable', true);
    container
      .bind<Weapon>('Weapon')
      .to(Katana)
      .whenTargetTagged('throwable', false);

    container
      .bind<interfaces.Factory<Weapon>>('Factory<Weapon>')
      .toFactory<
        Weapon,
        [boolean]
      >((context: interfaces.Context) => (throwable: boolean) => context.container.getTagged<Weapon>('Weapon', 'throwable', throwable));

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
    container.bind<Engine>('Engine').to(PetrolEngine).whenTargetNamed('petrol');
    container.bind<Engine>('Engine').to(DieselEngine).whenTargetNamed('diesel');

    container
      .bind<interfaces.Factory<Engine>>('Factory<Engine>')
      .toFactory<
        Engine,
        [string],
        [number]
      >((context: interfaces.Context) => (theNamed: string) => (displacement: number) => {
        const theEngine: Engine = context.container.getNamed<Engine>(
          'Engine',
          theNamed,
        );
        theEngine.displacement = displacement;
        return theEngine;
      });

    container.bind<CarFactory>('DieselCarFactory').to(DieselCarFactory);

    const dieselCarFactory: CarFactory =
      container.get<CarFactory>('DieselCarFactory');
    const engine: Engine = dieselCarFactory.createEngine(300);

    expect(engine.displacement).eql(300);
    expect(engine instanceof DieselEngine).eql(true);
  });

  it('Should support the injection of auto factories', () => {
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
    class Shuriken {
      public throw() {
        return 'hit!';
      }
    }

    @injectable()
    class NinjaWithAutoFactory implements Ninja {
      private readonly _katana: Katana;
      private readonly _shuriken: Shuriken;

      constructor(
        @inject('Factory<Katana>') katanaAutoFactory: () => Katana,
        @inject('Shuriken') shuriken: Shuriken,
      ) {
        this._katana = katanaAutoFactory();
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
    container.bind<Ninja>('Ninja').to(NinjaWithAutoFactory);
    container.bind<Shuriken>('Shuriken').to(Shuriken);
    container.bind<Katana>('Katana').to(Katana);
    container
      .bind<interfaces.Factory<Katana>>('Factory<Katana>')
      .toAutoFactory<Katana>('Katana');

    const ninja: Ninja = container.get<Ninja>('Ninja');

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');
  });

  it('Should support the injection of auto named factories', () => {
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
    class Shuriken {
      public throw() {
        return 'hit!';
      }
    }

    @injectable()
    class NinjaWithAutoNamedFactory implements Ninja {
      private readonly _katana: Katana;
      private readonly _shuriken: Shuriken;

      constructor(
        @inject('Factory<Weapon>')
        weaponFactory: <TWeapon>(named: string) => TWeapon,
      ) {
        this._katana = weaponFactory<Katana>('katana');
        this._shuriken = weaponFactory<Shuriken>('shuriken');
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>('Ninja').to(NinjaWithAutoNamedFactory);
    container.bind<Shuriken>('Shuriken').to(Shuriken);
    container.bind<Katana>('Katana').to(Katana);
    container.bind<Katana>('Weapon').to(Katana).whenTargetNamed('katana');
    container.bind<Shuriken>('Weapon').to(Shuriken).whenTargetNamed('shuriken');
    container
      .bind<interfaces.Factory<unknown>>('Factory<Weapon>')
      .toAutoNamedFactory<unknown>('Weapon');

    const ninja: Ninja = container.get<Ninja>('Ninja');

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');
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

    container.bind<KatanaProvider>('Provider<Katana>').toProvider<Katana>(
      (context: interfaces.Context) => async () =>
        new Promise<Katana>((resolve: (value: Katana) => void) => {
          const katana: Katana = context.container.get<Katana>('Katana');
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
    container.bind('Weapon').to(Katana).whenTargetTagged('canThrow', false);
    container.bind('Weapon').to(Shuriken).whenTargetTagged(Tag.CanThrow, true);

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

    const throwable: <T>(
      target: DecoratorTarget,
      targetKey?: string | symbol,
      indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<T>,
    ) => void = tagged('canThrow', true);
    const notThrowable: <T>(
      target: DecoratorTarget,
      targetKey?: string | symbol,
      indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<T>,
    ) => void = tagged('canThrow', false);

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
    container.bind('Weapon').to(Katana).whenTargetTagged('canThrow', false);
    container.bind('Weapon').to(Shuriken).whenTargetTagged('canThrow', true);

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
    container.bind('Weapon').to(Katana).whenTargetNamed('strong');
    container.bind('Weapon').to(Shuriken).whenTargetNamed(name);

    const ninja: Warrior = container.get<Warrior>('Warrior');
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);
  });

  it('Should support contextual bindings and targetName annotation', () => {
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
        @inject('Weapon') @targetName('katana') katana: unknown,
        @inject('Weapon') @targetName('shuriken') shuriken: unknown,
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>('Warrior').to(Ninja);

    container
      .bind('Weapon')
      .to(Katana)
      .when(
        (request: interfaces.Request | null) =>
          request !== null &&
          (request.target as interfaces.Target | null) !== null &&
          request.target.name.equals('katana'),
      );

    container
      .bind('Weapon')
      .to(Shuriken)
      .when(
        (request: interfaces.Request | null) =>
          request !== null &&
          (request.target as interfaces.Target | null) !== null &&
          request.target.name.equals('shuriken'),
      );

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
    container.bind<Weapon>('Weapon').to(Katana).whenTargetNamed('japonese');
    container.bind<Weapon>('Weapon').to(Shuriken).whenTargetNamed('chinese');

    const katana: Weapon = container.getNamed<Weapon>('Weapon', 'japonese');
    const shuriken: Weapon = container.getNamed<Weapon>('Weapon', 'chinese');

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
      .whenTargetTagged('faction', 'samurai');
    container
      .bind<Weapon>('Weapon')
      .to(Shuriken)
      .whenTargetTagged('faction', 'ninja');

    const katana: Weapon = container.getTagged<Weapon>(
      'Weapon',
      'faction',
      'samurai',
    );
    const shuriken: Weapon = container.getTagged<Weapon>(
      'Weapon',
      'faction',
      'ninja',
    );

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

    // Important: derived classes constructor must be manually implemented and annotated
    // Therefore the following will fail
    @injectable()
    class SamuraiMaster extends Samurai implements Warrior {
      public isMaster!: boolean;
    }

    // However, he following will work
    @injectable()
    class SamuraiMaster2 extends Samurai implements Warrior {
      public isMaster: boolean;
      constructor(@inject(SYMBOLS.Weapon) weapon: Weapon) {
        super(weapon);
        this.isMaster = true;
      }
    }

    const container: Container = new Container();
    container.bind<Weapon>(SYMBOLS.Weapon).to(Katana);
    container.bind<Warrior>(SYMBOLS.Samurai).to(Samurai);
    container.bind<Warrior>(SYMBOLS.SamuraiMaster).to(SamuraiMaster);
    container.bind<Warrior>(SYMBOLS.SamuraiMaster2).to(SamuraiMaster2);

    const errorFunction: () => void = () => {
      container.get<Warrior>(SYMBOLS.SamuraiMaster);
    };
    const error: string =
      'No matching bindings found for serviceIdentifier: Object';
    expect(errorFunction).to.throw(error);

    const samuraiMaster2: SamuraiMaster2 = container.get<SamuraiMaster2>(
      SYMBOLS.SamuraiMaster2,
    );
    expect(samuraiMaster2.weapon.name).eql('katana');
    expect(typeof samuraiMaster2.isMaster).eql('boolean');
  });

  it('Should allow to flag arguments as unmanaged', () => {
    const container: Container = new Container();

    // CASE 1: should throw

    const base1Id: string = 'Base1';

    @injectable()
    class Base1 {
      public prop: string;
      constructor(arg: string) {
        this.prop = arg;
      }
    }

    @injectable()
    class Derived1 extends Base1 {
      constructor() {
        super('unmanaged-injected-value');
      }
    }

    container.bind<Base1>(base1Id).to(Derived1);
    const tryGet: () => void = () => {
      container.get(base1Id);
    };
    const error: string = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH('Derived1');
    expect(tryGet).to.throw(error);

    // CASE 2: Use @unmanaged to overcome issue

    const base2Id: string = 'Base2';

    @injectable()
    class Base2 {
      public prop1: string;
      constructor(@unmanaged() arg1: string) {
        this.prop1 = arg1;
      }
    }

    @injectable()
    class Derived2 extends Base2 {
      constructor() {
        super('unmanaged-injected-value');
      }
    }

    container.bind<Base2>(base2Id).to(Derived2);
    const derived1: Base2 = container.get<Base2>(base2Id);
    expect(derived1 instanceof Derived2).to.eql(true);
    expect(derived1.prop1).to.eql('unmanaged-injected-value');

    // CASE 3: Use @unmanaged to overcome issue when multiple args

    const base3Id: string = 'Base3';

    @injectable()
    class Base3 {
      public prop1: string;
      public prop2: string;
      constructor(@unmanaged() arg1: string, arg2: string) {
        this.prop1 = arg1;
        this.prop2 = arg2;
      }
    }

    @injectable()
    class Derived3 extends Base3 {
      constructor(@inject('SomeId') arg1: string) {
        super('unmanaged-injected-value', arg1);
      }
    }

    container.bind<Base3>(base3Id).to(Derived3);
    container.bind<string>('SomeId').toConstantValue('managed-injected-value');
    const derived2: Base3 = container.get<Base3>(base3Id);
    expect(derived2 instanceof Base3).to.eql(true);
    expect(derived2.prop1).to.eql('unmanaged-injected-value');
    expect(derived2.prop2).to.eql('managed-injected-value');
  });

  it('Should support a whenInjectedInto contextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

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
    class Bokken implements Weapon {
      public name: string;
      constructor() {
        this.name = 'bokken';
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') @targetName('weapon') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {
      public weapon: Weapon;

      constructor(@inject('Weapon') @targetName('weapon') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTargetTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTargetTagged('master', true);
    container
      .bind<Weapon>(TYPES.Weapon)
      .to(Katana)
      .whenInjectedInto(NinjaMaster);
    container
      .bind<Weapon>(TYPES.Weapon)
      .to(Bokken)
      .whenInjectedInto(NinjaStudent);

    const master: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      true,
    );
    const student: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      false,
    );

    expect(master instanceof NinjaMaster).eql(true);
    expect(student instanceof NinjaStudent).eql(true);

    expect(master.weapon.name).eql('katana');
    expect(student.weapon.name).eql('bokken');
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
      .whenTargetTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTargetTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container.bind<Material>(TYPES.Material).to(Iron).whenParentNamed('lethal');
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenParentNamed('non-lethal');

    const master: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      true,
    );
    const student: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      false,
    );

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
      .whenTargetTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTargetTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenParentTagged('lethal', true);
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenParentTagged('lethal', false);

    const master: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      true,
    );
    const student: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      false,
    );

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

    // whenAnyAncestorIs
    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTargetTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTargetTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenAnyAncestorIs(NinjaMaster);
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenAnyAncestorIs(NinjaStudent);

    const master: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      true,
    );
    const student: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      false,
    );

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorIs
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTargetTagged('master', false);
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTargetTagged('master', true);
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenNoAncestorIs(NinjaStudent);
    container2
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenNoAncestorIs(NinjaMaster);

    const master2: Ninja = container2.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      true,
    );
    const student2: Ninja = container2.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      false,
    );

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
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTargetNamed('non-lethal');
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTargetNamed('lethal');
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenAnyAncestorNamed('lethal');
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenAnyAncestorNamed('non-lethal');

    const master: Ninja = container.getNamed<Ninja>(TYPES.Ninja, 'lethal');
    const student: Ninja = container.getNamed<Ninja>(TYPES.Ninja, 'non-lethal');

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorNamed
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTargetNamed('non-lethal');
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTargetNamed('lethal');
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenNoAncestorNamed('non-lethal');
    container2
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenNoAncestorNamed('lethal');

    const master2: Ninja = container.getNamed<Ninja>(TYPES.Ninja, 'lethal');
    const student2: Ninja = container.getNamed<Ninja>(
      TYPES.Ninja,
      'non-lethal',
    );

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
      .whenTargetTagged('lethal', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTargetTagged('lethal', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenAnyAncestorTagged('lethal', true);
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenAnyAncestorTagged('lethal', false);

    const master: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'lethal',
      true,
    );
    const student: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'lethal',
      false,
    );

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorTagged
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTargetTagged('lethal', false);
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTargetTagged('lethal', true);
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenNoAncestorTagged('lethal', false);
    container2
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenNoAncestorTagged('lethal', true);

    const master2: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'lethal',
      true,
    );
    const student2: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'lethal',
      false,
    );

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
    const anyAncestorIsNinjaMasterConstraint: (
      request: interfaces.Request | null,
    ) => boolean = typeConstraint(NinjaMaster);
    const anyAncestorIsNinjaStudentConstraint: (
      request: interfaces.Request | null,
    ) => boolean = typeConstraint(NinjaStudent);

    // whenAnyAncestorMatches
    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTargetTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTargetTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenAnyAncestorMatches(anyAncestorIsNinjaMasterConstraint);
    container
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenAnyAncestorMatches(anyAncestorIsNinjaStudentConstraint);

    const master: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      true,
    );
    const student: Ninja = container.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      false,
    );

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorMatches
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTargetTagged('master', false);
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTargetTagged('master', true);
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2
      .bind<Material>(TYPES.Material)
      .to(Iron)
      .whenNoAncestorMatches(anyAncestorIsNinjaStudentConstraint);
    container2
      .bind<Material>(TYPES.Material)
      .to(Wood)
      .whenNoAncestorMatches(anyAncestorIsNinjaMasterConstraint);

    const master2: Ninja = container2.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      true,
    );
    const student2: Ninja = container2.getTagged<Ninja>(
      TYPES.Ninja,
      'master',
      false,
    );

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
