import { expect } from 'chai';
import * as ERROR_MSGS from '../src/constants/error_msgs';
import { interfaces } from '../src/interfaces/interfaces';
import { Container, ContainerModule, decorate, inject, injectable, LazyServiceIdentifer, multiInject, named, tagged, targetName, typeConstraint, unmanaged } from '../src/inversify';

describe('InversifyJS', () => {

  it('Should be able to resolve and inject dependencies', () => {

    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Katana {
      hit(): string;
    }

    interface Shuriken {
      throw(): string;
    }

    @injectable()
    class Katana implements Katana {
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
    class Ninja implements Ninja {

      private _katana: Katana;
      private _shuriken: Shuriken;

      public constructor(
        @inject('Katana') katana: Katana,
        @inject('Shuriken') shuriken: Shuriken
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const container = new Container();
    container.bind<Ninja>('Ninja').to(Ninja);
    container.bind<Katana>('Katana').to(Katana);
    container.bind<Shuriken>('Shuriken').to(Shuriken);

    const ninja = container.get<Ninja>('Ninja');

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

      private _shuriken!: Shuriken;
      @inject(Shuriken)
      public set Shuriken(shuriken: Shuriken) {
        this._shuriken = shuriken;
      }
      @inject(Katana)
      public katana!: Katana;
      public sneak() { return this._shuriken.throw(); }
      public fight() { return this.katana.hit(); }

    }

    const container = new Container();
    container.bind<Ninja>('Ninja').to(Ninja);
    container.bind(Shuriken).toSelf();
    container.bind(Katana).toSelf();

    const ninja = container.get<Ninja>('Ninja');
    expect(ninja.sneak()).to.eql('hit!');
    expect(ninja.fight()).to.eql('cut!');
  });

  it('Should be able to resolve and inject dependencies in VanillaJS', () => {

    const TYPES = {
      Katana: 'Katana',
      Ninja: 'Ninja',
      Shuriken: 'Shuriken',
      Blowgun: 'Blowgun'
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

      public constructor(katana: Katana, shuriken: Shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
      }
      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }
      public poisonDart() { return this._blowgun.blow(); }

      public set blowgun(blowgun: Blowgun) {
        this._blowgun = blowgun;
      }
    }

    decorate(injectable(), Katana);
    decorate(injectable(), Shuriken);
    decorate(injectable(), Ninja);
    decorate(injectable(), Blowgun);
    decorate(inject(TYPES.Katana), Ninja, 0);
    decorate(inject(TYPES.Shuriken), Ninja, 1);
    decorate(inject(TYPES.Blowgun), Ninja.prototype, 'blowgun');

    const container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(Ninja);
    container.bind<Katana>(TYPES.Katana).to(Katana);
    container.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);
    container.bind<Blowgun>(TYPES.Blowgun).to(Blowgun);

    const ninja = container.get<Ninja>(TYPES.Ninja);

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

      private _katana: Katana;
      private _shuriken: Shuriken;

      public constructor(katana: Katana, shuriken: Shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const container = new Container();
    container.bind<Ninja>(Ninja).to(Ninja);
    container.bind<Katana>(Katana).to(Katana);
    container.bind<Shuriken>(Shuriken).to(Shuriken);

    const ninja = container.get<Ninja>(Ninja);

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');

  });

  it('Should be able to use Symbols as runtime identifiers', () => {

    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Katana {
      hit(): string;
    }

    interface Shuriken {
      throw(): string;
    }

    @injectable()
    class Katana implements Katana {
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

    const TYPES = {
      Katana: Symbol.for('Katana'),
      Ninja: Symbol.for('Ninja'),
      Shuriken: Symbol.for('Shuriken')
    };

    @injectable()
    class Ninja implements Ninja {

      private _katana: Katana;
      private _shuriken: Shuriken;

      public constructor(
        @inject(TYPES.Katana) katana: Katana,
        @inject(TYPES.Shuriken) shuriken: Shuriken
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(Ninja);
    container.bind<Katana>(TYPES.Katana).to(Katana);
    container.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);

    const ninja = container.get<Ninja>(TYPES.Ninja);

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');

  });

  it('Should be able to wrap Symbols with LazyServiceIdentifer', () => {

    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Katana {
      hit(): string;
    }

    interface Shuriken {
      throw(): string;
    }

    @injectable()
    class Katana implements Katana {
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

    const TYPES = {
      Katana: Symbol.for('Katana'),
      Ninja: Symbol.for('Ninja'),
      Shuriken: Symbol.for('Shuriken')
    };

    @injectable()
    class Ninja implements Ninja {

      private _katana: Katana;
      private _shuriken: Shuriken;

      public constructor(
        @inject(new LazyServiceIdentifer(() => TYPES.Katana)) katana: Katana,
        @inject(new LazyServiceIdentifer(() => TYPES.Shuriken)) shuriken: Shuriken
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(Ninja);
    container.bind<Katana>(TYPES.Katana).to(Katana);
    container.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);

    const ninja = container.get<Ninja>(TYPES.Ninja);

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');

  });

  it('Should support Container modules', () => {

    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Katana {
      hit(): string;
    }

    interface Shuriken {
      throw(): string;
    }

    @injectable()
    class Katana implements Katana {
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
    class Ninja implements Ninja {

      private _katana: Katana;
      private _shuriken: Shuriken;

      public constructor(@inject('Katana') katana: Katana, @inject('Shuriken') shuriken: Shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const warriors = new ContainerModule((bind: interfaces.Bind) => {
      bind<Ninja>('Ninja').to(Ninja);
    });

    const weapons = new ContainerModule((bind: interfaces.Bind) => {
      bind<Katana>('Katana').to(Katana);
      bind<Shuriken>('Shuriken').to(Shuriken);
    });

    const container = new Container();

    // load
    container.load(warriors, weapons);

    const ninja = container.get<Ninja>('Ninja');

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');

    const tryGetNinja = () => { container.get('Ninja'); };
    const tryGetKatana = () => { container.get('Katana'); };
    const tryGetShuruken = () => { container.get('Shuriken'); };

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

    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Katana {
      hit(): string;
    }

    interface Shuriken {
      throw(): string;
    }

    @injectable()
    class Katana implements Katana {
      private _usageCount: number;
      public constructor() {
        this._usageCount = 0;
      }
      public hit() {
        this._usageCount = this._usageCount + 1;
        return `This katana was used ${this._usageCount} times!`;
      }
    }

    @injectable()
    class Shuriken implements Shuriken {
      private _shurikenCount: number;
      public constructor() {
        this._shurikenCount = 10;
      }
      public throw() {
        this._shurikenCount = this._shurikenCount - 1;
        return `Only ${this._shurikenCount} items left!`;
      }
    }

    @injectable()
    class Ninja implements Ninja {

      private _katana: Katana;
      private _shuriken: Shuriken;

      public constructor(
        @inject('Katana') katana: Katana,
        @inject('Shuriken') shuriken: Shuriken
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const container = new Container();
    container.bind<Ninja>('Ninja').to(Ninja);
    container.bind<Katana>('Katana').to(Katana).inSingletonScope();
    container.bind<Shuriken>('Shuriken').to(Shuriken);

    const ninja1 = container.get<Ninja>('Ninja');
    expect(ninja1.fight()).eql('This katana was used 1 times!');
    expect(ninja1.fight()).eql('This katana was used 2 times!');
    expect(ninja1.sneak()).eql('Only 9 items left!');
    expect(ninja1.sneak()).eql('Only 8 items left!');

    const ninja2 = container.get<Ninja>('Ninja');
    expect(ninja2.fight()).eql('This katana was used 3 times!');
    expect(ninja2.sneak()).eql('Only 9 items left!');

  });

  it('Should support the injection of classes to itself', () => {

    const heroName = 'superman';

    @injectable()
    class Hero {
      public name: string;
      public constructor() {
        this.name = heroName;
      }
    }

    const container = new Container();
    container.bind(Hero).toSelf();
    const hero = container.get<Hero>(Hero);

    expect(hero.name).eql(heroName);

  });

  it('Should support the injection of constant values', () => {

    interface Warrior {
      name: string;
    }

    const TYPES = {
      Warrior: 'Warrior'
    };

    const heroName = 'superman';

    @injectable()
    class Hero implements Warrior {
      public name: string;
      public constructor() {
        this.name = heroName;
      }
    }

    const container = new Container();
    container.bind<Warrior>(TYPES.Warrior).toConstantValue(new Hero());
    const hero = container.get<Warrior>(TYPES.Warrior);

    expect(hero.name).eql(heroName);

  });

  it('Should support the injection of dynamic values', () => {

    interface UseDate {
      doSomething(): Date;
    }

    @injectable()
    class UseDate implements UseDate {
      public currentDate: Date;
      public constructor(@inject('Date') currentDate: Date) {
        this.currentDate = currentDate;
      }
      public doSomething() {
        return this.currentDate;
      }
    }

    const container = new Container();
    container.bind<UseDate>('UseDate').to(UseDate);
    container.bind<Date>('Date').toDynamicValue((context: interfaces.Context) => new Date());

    const subject1 = container.get<UseDate>('UseDate');
    const subject2 = container.get<UseDate>('UseDate');
    expect(subject1.doSomething() === subject2.doSomething()).eql(false);

    container.unbind('Date');
    container.bind<Date>('Date').toConstantValue(new Date());

    const subject3 = container.get<UseDate>('UseDate');
    const subject4 = container.get<UseDate>('UseDate');
    expect(subject3.doSomething() === subject4.doSomething()).eql(true);

  });

  it('Should support the injection of Functions', () => {

    const ninjaId = 'Ninja';
    const longDistanceWeaponId = 'LongDistanceWeapon';
    const shortDistanceWeaponFactoryId = 'ShortDistanceWeaponFactory';

    type ShortDistanceWeaponFactory = () => ShortDistanceWeapon;

    interface KatanaBlade { }

    @injectable()
    class KatanaBlade implements KatanaBlade { }

    interface KatanaHandler { }

    @injectable()
    class KatanaHandler implements KatanaHandler { }

    interface ShortDistanceWeapon {
      handler: KatanaHandler;
      blade: KatanaBlade;
    }

    @injectable()
    class Katana implements ShortDistanceWeapon {
      public handler: KatanaHandler;
      public blade: KatanaBlade;
      public constructor(handler: KatanaHandler, blade: KatanaBlade) {
        this.handler = handler;
        this.blade = blade;
      }
    }

    interface LongDistanceWeapon { }

    @injectable()
    class Shuriken implements LongDistanceWeapon { }

    interface Warrior {
      shortDistanceWeaponFactory: ShortDistanceWeaponFactory;
      longDistanceWeapon: LongDistanceWeapon;
    }

    @injectable()
    class Ninja implements Warrior {
      public shortDistanceWeaponFactory: ShortDistanceWeaponFactory;
      public longDistanceWeapon: LongDistanceWeapon;
      public constructor(
        @inject(shortDistanceWeaponFactoryId) @targetName('katana') shortDistanceWeaponFactory: ShortDistanceWeaponFactory,
        @inject(longDistanceWeaponId) @targetName('shuriken') longDistanceWeapon: LongDistanceWeapon
      ) {
        this.shortDistanceWeaponFactory = shortDistanceWeaponFactory;
        this.longDistanceWeapon = longDistanceWeapon;
      }
    }

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<LongDistanceWeapon>(longDistanceWeaponId).to(Shuriken);

    const katanaFactory = function () {
      return new Katana(new KatanaHandler(), new KatanaBlade());
    };

    container.bind<ShortDistanceWeaponFactory>(shortDistanceWeaponFactoryId).toFunction(katanaFactory); // IMPORTANT!
    const ninja = container.get<Ninja>(ninjaId);

    expect(ninja instanceof Ninja).eql(true);
    expect(typeof ninja.shortDistanceWeaponFactory === 'function').eql(true);
    expect(ninja.shortDistanceWeaponFactory() instanceof Katana).eql(true);
    expect(ninja.shortDistanceWeaponFactory().handler instanceof KatanaHandler).eql(true);
    expect(ninja.shortDistanceWeaponFactory().blade instanceof KatanaBlade).eql(true);
    expect(ninja.longDistanceWeapon instanceof Shuriken).eql(true);

  });

  it('Should support the injection of class constructors', () => {

    interface Katana {
      hit(): string;
    }

    @injectable()
    class Katana implements Katana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class Ninja {

      private _katana: Katana;

      public constructor(
        @inject('Newable<Katana>') katana: interfaces.Newable<Katana>
      ) {
        this._katana = new katana();
      }

      public fight() { return this._katana.hit(); }
    }

    const container = new Container();
    container.bind<Ninja>('Ninja').to(Ninja);
    container.bind<interfaces.Newable<Katana>>('Newable<Katana>').toConstructor<Katana>(Katana);

    const ninja = container.get<Ninja>('Ninja');

    expect(ninja.fight()).eql('cut!');

  });

  it('Should support the injection of user defined factories', () => {

    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Katana {
      hit(): string;
    }

    interface Shuriken {
      throw(): string;
    }

    @injectable()
    class Katana implements Katana {
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

      private _katana: Katana;
      private _shuriken: Shuriken;

      public constructor(
        @inject('Factory<Katana>') katanaFactory: () => Katana,
        @inject('Shuriken') shuriken: Shuriken
      ) {
        this._katana = katanaFactory();
        this._shuriken = shuriken;
      }

      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const container = new Container();
    container.bind<Ninja>('Ninja').to(NinjaWithUserDefinedFactory);
    container.bind<Shuriken>('Shuriken').to(Shuriken);
    container.bind<Katana>('Katana').to(Katana);
    container.bind<interfaces.Factory<Katana>>('Factory<Katana>').toFactory<Katana>((context) =>
      () =>
        context.container.get<Katana>('Katana'));

    const ninja = container.get<Ninja>('Ninja');

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

      private _katana: Weapon;
      private _shuriken: Weapon;

      public constructor(
        @inject('Factory<Weapon>') weaponFactory: (throwable: boolean) => Weapon
      ) {
        this._katana = weaponFactory(false);
        this._shuriken = weaponFactory(true);
      }

      public fight() { return this._katana.use(); }
      public sneak() { return this._shuriken.use(); }

    }

    const container = new Container();
    container.bind<Ninja>('Ninja').to(NinjaWithUserDefinedFactory);
    container.bind<Weapon>('Weapon').to(Shuriken).whenTargetTagged('throwable', true);
    container.bind<Weapon>('Weapon').to(Katana).whenTargetTagged('throwable', false);

    container.bind<interfaces.Factory<Weapon>>('Factory<Weapon>').toFactory<Weapon, [boolean]>((context) =>
      (throwable: boolean) =>
        context.container.getTagged<Weapon>('Weapon', 'throwable', throwable));

    const ninja = container.get<Ninja>('Ninja');

    expect(ninja.fight()).eql('katana!');
    expect(ninja.sneak()).eql('shuriken!');

  });

  it('Should support the injection of user defined factories with partial application', () => {

    interface InjectorPump { }

    @injectable()
    class InjectorPump implements InjectorPump { }

    interface SparkPlugs { }

    @injectable()
    class SparkPlugs implements SparkPlugs { }

    class Engine {
      public displacement!: number | null;
    }

    @injectable()
    class DieselEngine implements Engine {
      public displacement: number | null;
      private _injectorPump: InjectorPump;
      public constructor(
        @inject('InjectorPump') injectorPump: InjectorPump
      ) {
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
      private _sparkPlugs: SparkPlugs;
      public constructor(
        @inject('SparkPlugs') sparkPlugs: SparkPlugs
      ) {
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
      private _dieselFactory: (displacement: number) => Engine;
      public constructor(
        @inject('Factory<Engine>') factory: (category: string) => (displacement: number) => Engine
      ) {
        this._dieselFactory = factory('diesel');
      }
      public createEngine(displacement: number): Engine {
        return this._dieselFactory(displacement);
      }
    }

    const container = new Container();
    container.bind<SparkPlugs>('SparkPlugs').to(SparkPlugs);
    container.bind<InjectorPump>('InjectorPump').to(InjectorPump);
    container.bind<Engine>('Engine').to(PetrolEngine).whenTargetNamed('petrol');
    container.bind<Engine>('Engine').to(DieselEngine).whenTargetNamed('diesel');

    container.bind<interfaces.Factory<Engine>>('Factory<Engine>').toFactory<Engine, [string], [number]>((context: interfaces.Context) =>
      (theNamed: string) => (displacement: number) => {
        const theEngine = context.container.getNamed<Engine>('Engine', theNamed);
        theEngine.displacement = displacement;
        return theEngine;
      });

    container.bind<CarFactory>('DieselCarFactory').to(DieselCarFactory);

    const dieselCarFactory = container.get<CarFactory>('DieselCarFactory');
    const engine = dieselCarFactory.createEngine(300);

    expect(engine.displacement).eql(300);
    expect(engine instanceof DieselEngine).eql(true);

  });

  it('Should support the injection of auto factories', () => {

    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Katana {
      hit(): string;
    }

    interface Shuriken {
      throw(): string;
    }

    @injectable()
    class Katana implements Katana {
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
    class NinjaWithAutoFactory implements Ninja {

      private _katana: Katana;
      private _shuriken: Shuriken;

      public constructor(
        @inject('Factory<Katana>') katanaAutoFactory: () => Katana,
        @inject('Shuriken') shuriken: Shuriken
      ) {
        this._katana = katanaAutoFactory();
        this._shuriken = shuriken;
      }

      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const container = new Container();
    container.bind<Ninja>('Ninja').to(NinjaWithAutoFactory);
    container.bind<Shuriken>('Shuriken').to(Shuriken);
    container.bind<Katana>('Katana').to(Katana);
    container.bind<interfaces.Factory<Katana>>('Factory<Katana>').toAutoFactory<Katana>('Katana');

    const ninja = container.get<Ninja>('Ninja');

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');

  });

  it('Should support the injection of auto named factories', () => {

    interface Ninja {
      fight(): string;
      sneak(): string;
    }
    interface Weapon { }

    interface Katana extends Weapon {
      hit(): string;
    }

    interface Shuriken extends Weapon {
      throw(): string;
    }

    @injectable()
    class Katana implements Katana {
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
    class NinjaWithAutoNamedFactory implements Ninja {

      private _katana: Katana;
      private _shuriken: Shuriken;

      public constructor(
        @inject('Factory<Weapon>') weaponFactory: <TWeapon extends Weapon = Weapon>(named: string) => TWeapon
      ) {
        this._katana = weaponFactory<Katana>('katana');
        this._shuriken = weaponFactory<Shuriken>('shuriken');
      }

      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const container = new Container();
    container.bind<Ninja>('Ninja').to(NinjaWithAutoNamedFactory);
    container.bind<Shuriken>('Shuriken').to(Shuriken);
    container.bind<Katana>('Katana').to(Katana);
    container.bind<Weapon>('Weapon').to(Katana).whenTargetNamed('katana');
    container.bind<Weapon>('Weapon').to(Shuriken).whenTargetNamed('shuriken');
    container.bind<interfaces.Factory<Weapon>>('Factory<Weapon>').toAutoNamedFactory<Weapon>('Weapon');

    const ninja = container.get<Ninja>('Ninja');

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');

  });

  it('Should support the injection of providers', (done) => {

    type KatanaProvider = () => Promise<Katana>;

    interface Ninja {
      katana: Katana | null;
      katanaProvider: KatanaProvider;
    }

    interface Katana {
      hit(): string;
    }

    @injectable()
    class Katana implements Katana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class NinjaWithProvider implements Ninja {

      public katana: Katana | null;
      public katanaProvider: KatanaProvider;

      public constructor(
        @inject('Provider<Katana>') katanaProvider: KatanaProvider
      ) {
        this.katanaProvider = katanaProvider;
        this.katana = null;
      }

    }

    const container = new Container();
    container.bind<Ninja>('Ninja').to(NinjaWithProvider);
    container.bind<Katana>('Katana').to(Katana);

    container.bind<KatanaProvider>('Provider<Katana>').toProvider<Katana>((context: interfaces.Context) =>
      () =>
        new Promise<Katana>((resolve) => {
          const katana = context.container.get<Katana>('Katana');
          resolve(katana);
        }));

    const ninja = container.get<Ninja>('Ninja');

    ninja.katanaProvider()
      .then((katana) => {
        ninja.katana = katana;
        expect(ninja.katana.hit()).eql('cut!');
        done();
      })
      .catch((e) => { /* do nothing */ });

  });

  describe('Injection of multiple values with string as keys', () => {

    it('Should support the injection of multiple values', () => {

      const warriorId = 'Warrior';
      const weaponId = 'Weapon';

      interface Weapon {
        name: string;
      }

      @injectable()
      class Katana implements Weapon {
        public name = 'Katana';
      }

      @injectable()
      class Shuriken implements Weapon {
        public name = 'Shuriken';
      }

      interface Warrior {
        katana: Weapon;
        shuriken: Weapon;
      }

      @injectable()
      class Ninja implements Warrior {
        public katana: Weapon;
        public shuriken: Weapon;
        public constructor(@multiInject(weaponId) weapons: Weapon[]) {
          this.katana = weapons[0] as Weapon;
          this.shuriken = weapons[1] as Weapon;
        }
      }

      const container = new Container();
      container.bind<Warrior>(warriorId).to(Ninja);
      container.bind<Weapon>(weaponId).to(Katana);
      container.bind<Weapon>(weaponId).to(Shuriken);

      const ninja = container.get<Warrior>(warriorId);
      expect(ninja.katana.name).eql('Katana');
      expect(ninja.shuriken.name).eql('Shuriken');

      // if only one value is bound to Weapon
      const container2 = new Container();
      container2.bind<Warrior>(warriorId).to(Ninja);
      container2.bind<Weapon>(weaponId).to(Katana);

      const ninja2 = container2.get<Warrior>(warriorId);
      expect(ninja2.katana.name).eql('Katana');

    });

    it('Should support the injection of multiple values with nested inject', () => {

      interface Ninja {
        fight(): string;
        sneak(): string;
      }

      interface Katana {
        hit(): string;
      }

      interface Shuriken {
        throw(): string;
      }

      @injectable()
      class Katana implements Katana {
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
      class Ninja implements Ninja {

        private _katana: Katana;
        private _shuriken: Shuriken;

        public constructor(
          @inject('Katana') katana: Katana,
          @inject('Shuriken') shuriken: Shuriken
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() { return this._katana.hit(); }
        public sneak() { return this._shuriken.throw(); }

      }

      interface School {
        ninjaMaster: Ninja;
        student: Ninja;
      }

      @injectable()
      class NinjaSchool implements School {
        public ninjaMaster: Ninja;
        public student: Ninja;

        public constructor(
          @multiInject('Ninja') ninja: Ninja[]
        ) {
          this.ninjaMaster = ninja[0] as Ninja;
          this.student = ninja[1] as Ninja;
        }
      }

      const container = new Container();
      container.bind<Katana>('Katana').to(Katana);
      container.bind<Shuriken>('Shuriken').to(Shuriken);
      container.bind<Ninja>('Ninja').to(Ninja);
      container.bind<Ninja>('Ninja').to(Ninja);
      container.bind<School>('School').to(NinjaSchool);

      const ninjaSchool = container.get<School>('School');
      expect(ninjaSchool.ninjaMaster.fight()).eql('cut!');
      expect(ninjaSchool.ninjaMaster.sneak()).eql('hit!');

      expect(ninjaSchool.student.fight()).eql('cut!');
      expect(ninjaSchool.student.sneak()).eql('hit!');

    });

    it('Should support the injection of multiple values with nested multiInject', () => {

      const warriorId = 'Warrior';
      const swordId = 'Sword';
      const shurikenId = 'Shuriken';
      const schoolId = 'School';
      const organisationId = 'Organisation';

      interface Warrior {
        fight(): string;
        sneak(): string;
      }

      interface Sword {
        hit(): string;
      }

      interface Shuriken {
        throw(): string;
      }

      @injectable()
      class Katana implements Sword {
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
      class Ninja implements Warrior {

        private _katana: Sword;
        private _shuriken: Shuriken;

        public constructor(
          @inject(swordId) katana: Sword,
          @inject(shurikenId) shuriken: Shuriken
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() { return this._katana.hit(); }
        public sneak() { return this._shuriken.throw(); }

      }

      interface School {
        ninjaMaster: Warrior;
        student: Warrior;
      }

      @injectable()
      class NinjaSchool implements School {

        public ninjaMaster: Warrior;
        public student: Warrior;

        public constructor(
          @multiInject(warriorId) ninjas: Ninja[]
        ) {
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

        public constructor(
          @multiInject(schoolId) schools: School[]
        ) {
          this.schools = schools;
        }
      }

      const container = new Container();
      container.bind<Sword>(swordId).to(Katana);
      container.bind<Shuriken>(shurikenId).to(Shuriken);
      container.bind<Warrior>(warriorId).to(Ninja);
      container.bind<Warrior>(warriorId).to(Ninja);
      container.bind<School>(schoolId).to(NinjaSchool);
      container.bind<School>(schoolId).to(NinjaSchool);
      container.bind<Organisation>(organisationId).to(NinjaOrganisation);

      const ninjaOrganisation = container.get<Organisation>(organisationId);

      for (let i = 0; i < 2; i++) {
        const ithNinjaOrganizationSchool = ninjaOrganisation.schools[i] as School;

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
        public constructor() {
          super();
          this.name = 'Katana';
        }
      }

      @injectable()
      class Shuriken extends Weapon {
        public constructor() {
          super();
          this.name = 'Shuriken';
        }
      }

      @injectable()
      class Ninja {
        public katana: Weapon;
        public shuriken: Weapon;
        public constructor(@multiInject(Weapon) weapons: Weapon[]) {
          this.katana = weapons[0] as Weapon;
          this.shuriken = weapons[1] as Weapon;
        }
      }

      const container = new Container();
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<Weapon>(Weapon).to(Katana);
      container.bind<Weapon>(Weapon).to(Shuriken);

      const ninja = container.get<Ninja>(Ninja);
      expect(ninja.katana.name).eql('Katana');
      expect(ninja.shuriken.name).eql('Shuriken');

      // if only one value is bound to Weapon
      const container2 = new Container();
      container2.bind<Ninja>(Ninja).to(Ninja);
      container2.bind<Weapon>(Weapon).to(Katana);

      const ninja2 = container2.get<Ninja>(Ninja);
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

        private _katana: Katana;
        private _shuriken: Shuriken;

        public constructor(
          katana: Katana,
          shuriken: Shuriken
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() { return this._katana.hit(); }
        public sneak() { return this._shuriken.throw(); }

      }

      @injectable()
      class NinjaSchool {
        public ninjaMaster: Ninja;
        public student: Ninja;

        public constructor(
          @multiInject(Ninja) ninja: Ninja[]
        ) {
          this.ninjaMaster = ninja[0] as Ninja;
          this.student = ninja[1] as Ninja;
        }
      }

      const container = new Container();
      container.bind<Katana>(Katana).to(Katana);
      container.bind<Shuriken>(Shuriken).to(Shuriken);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);

      const ninjaSchool = container.get<NinjaSchool>(NinjaSchool);
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

        private _katana: Katana;
        private _shuriken: Shuriken;

        public constructor(
          katana: Katana,
          shuriken: Shuriken
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() { return this._katana.hit(); }
        public sneak() { return this._shuriken.throw(); }

      }

      @injectable()
      class NinjaSchool {
        public ninjaMaster: Ninja;
        public student: Ninja;

        public constructor(
          @multiInject(Ninja) ninjas: Ninja[]
        ) {
          this.ninjaMaster = ninjas[0] as Ninja;
          this.student = ninjas[1] as Ninja;
        }
      }

      @injectable()
      class NinjaOrganisation {
        public schools: NinjaSchool[];

        public constructor(
          @multiInject(NinjaSchool) schools: NinjaSchool[]
        ) {
          this.schools = schools;
        }
      }

      const container = new Container();
      container.bind<Katana>(Katana).to(Katana);
      container.bind<Shuriken>(Shuriken).to(Shuriken);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);
      container.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);
      container.bind<NinjaOrganisation>(NinjaOrganisation).to(NinjaOrganisation);

      const ninjaOrganisation = container.get<NinjaOrganisation>(NinjaOrganisation);

      for (let i = 0; i < 2; i++) {
        const ithNinjaOrganizationSchool = ninjaOrganisation.schools[i] as NinjaSchool;

        expect(ithNinjaOrganizationSchool.ninjaMaster.fight()).eql('cut!');
        expect(ithNinjaOrganizationSchool.ninjaMaster.sneak()).eql('hit!');
        expect(ithNinjaOrganizationSchool.student.fight()).eql('cut!');
        expect(ithNinjaOrganizationSchool.student.sneak()).eql('hit!');
      }

    });

  });

  describe('Injection of multiple values with Symbol as keys', () => {
    it('Should support the injection of multiple values when using Symbols as keys', () => {

      const TYPES = {
        Warrior: Symbol.for('Warrior'),
        Weapon: Symbol.for('Weapon')
      };

      interface Weapon {
        name: string;
      }

      @injectable()
      class Katana implements Weapon {
        public name = 'Katana';
      }

      @injectable()
      class Shuriken implements Weapon {
        public name = 'Shuriken';
      }

      interface Warrior {
        katana: Weapon;
        shuriken: Weapon;
      }

      @injectable()
      class Ninja implements Warrior {
        public katana: Weapon;
        public shuriken: Weapon;
        public constructor(@multiInject(TYPES.Weapon) weapons: Weapon[]) {
          this.katana = weapons[0] as Weapon;
          this.shuriken = weapons[1] as Weapon;
        }
      }

      const container = new Container();
      container.bind<Warrior>(TYPES.Warrior).to(Ninja);
      container.bind<Weapon>(TYPES.Weapon).to(Katana);
      container.bind<Weapon>(TYPES.Weapon).to(Shuriken);

      const ninja = container.get<Warrior>(TYPES.Warrior);
      expect(ninja.katana.name).eql('Katana');
      expect(ninja.shuriken.name).eql('Shuriken');

      // if only one value is bound to Weapon
      const container2 = new Container();
      container2.bind<Warrior>(TYPES.Warrior).to(Ninja);
      container2.bind<Weapon>(TYPES.Weapon).to(Katana);

      const ninja2 = container2.get<Warrior>(TYPES.Warrior);
      expect(ninja2.katana.name).eql('Katana');

    });

    it('Should support the injection of multiple values with nested inject', () => {

      const TYPES = {
        Katana: Symbol.for('Katana'),
        Ninja: Symbol.for('Ninja'),
        School: Symbol.for('School'),
        Shuriken: Symbol.for('Shuriken'),
      };

      interface Ninja {
        fight(): string;
        sneak(): string;
      }

      interface Katana {
        hit(): string;
      }

      interface Shuriken {
        throw(): string;
      }

      @injectable()
      class Katana implements Katana {
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
      class Ninja implements Ninja {

        private _katana: Katana;
        private _shuriken: Shuriken;

        public constructor(
          @inject(TYPES.Katana) katana: Katana,
          @inject(TYPES.Shuriken) shuriken: Shuriken
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() { return this._katana.hit(); }
        public sneak() { return this._shuriken.throw(); }

      }

      interface School {
        ninjaMaster: Ninja;
        student: Ninja;
      }

      @injectable()
      class NinjaSchool implements School {
        public ninjaMaster: Ninja;
        public student: Ninja;

        public constructor(
          @multiInject(TYPES.Ninja) ninja: Ninja[]
        ) {
          this.ninjaMaster = ninja[0] as Ninja;
          this.student = ninja[1] as Ninja;
        }
      }

      const container = new Container();
      container.bind<Katana>(TYPES.Katana).to(Katana);
      container.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);
      container.bind<Ninja>(TYPES.Ninja).to(Ninja);
      container.bind<Ninja>(TYPES.Ninja).to(Ninja);
      container.bind<School>(TYPES.School).to(NinjaSchool);

      const ninjaSchool = container.get<School>(TYPES.School);
      expect(ninjaSchool.ninjaMaster.fight()).eql('cut!');
      expect(ninjaSchool.ninjaMaster.sneak()).eql('hit!');

      expect(ninjaSchool.student.fight()).eql('cut!');
      expect(ninjaSchool.student.sneak()).eql('hit!');

    });

    it('Should support the injection of multiple values with nested multiInject', () => {

      const TYPES = {
        Katana: Symbol.for('Katana'),
        Ninja: Symbol.for('Ninja'),
        Organisation: Symbol.for('Organisation'),
        School: Symbol.for('School'),
        Shuriken: Symbol.for('Shuriken'),
      };

      interface Ninja {
        fight(): string;
        sneak(): string;
      }

      interface Katana {
        hit(): string;
      }

      interface Shuriken {
        throw(): string;
      }

      @injectable()
      class Katana implements Katana {
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
      class Ninja implements Ninja {

        private _katana: Katana;
        private _shuriken: Shuriken;

        public constructor(
          @inject(TYPES.Katana) katana: Katana,
          @inject(TYPES.Shuriken) shuriken: Shuriken
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() { return this._katana.hit(); }
        public sneak() { return this._shuriken.throw(); }

      }

      interface School {
        ninjaMaster: Ninja;
        student: Ninja;
      }

      @injectable()
      class NinjaSchool implements School {
        public ninjaMaster: Ninja;
        public student: Ninja;

        public constructor(
          @multiInject(TYPES.Ninja) ninjas: Ninja[]
        ) {
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

        public constructor(
          @multiInject(TYPES.School) schools: School[]
        ) {
          this.schools = schools;
        }
      }

      const container = new Container();
      container.bind<Katana>(TYPES.Katana).to(Katana);
      container.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);
      container.bind<Ninja>(TYPES.Ninja).to(Ninja);
      container.bind<Ninja>(TYPES.Ninja).to(Ninja);
      container.bind<School>(TYPES.School).to(NinjaSchool);
      container.bind<School>(TYPES.School).to(NinjaSchool);
      container.bind<Organisation>(TYPES.Organisation).to(NinjaOrganisation);

      const ninjaOrganisation = container.get<Organisation>(TYPES.Organisation);

      for (let i = 0; i < 2; i++) {
        const ithNinjaOrganizationSchool = ninjaOrganisation.schools[i] as School;

        expect(ithNinjaOrganizationSchool.ninjaMaster.fight()).eql('cut!');
        expect(ithNinjaOrganizationSchool.ninjaMaster.sneak()).eql('hit!');
        expect(ithNinjaOrganizationSchool.student.fight()).eql('cut!');
        expect(ithNinjaOrganizationSchool.student.sneak()).eql('hit!');
      }

    });
  });

  it('Should support tagged bindings', () => {

    enum Tag { CanThrow }

    interface Weapon { }

    @injectable()
    class Katana implements Weapon { }

    @injectable()
    class Shuriken implements Weapon { }

    interface Warrior {
      katana: Weapon;
      shuriken: Weapon;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Weapon;
      public shuriken: Weapon;
      public constructor(
        @inject('Weapon') @tagged('canThrow', false) katana: Weapon,
        @inject('Weapon') @tagged(Tag.CanThrow, true) shuriken: Weapon
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container = new Container();
    container.bind<Warrior>('Warrior').to(Ninja);
    container.bind<Weapon>('Weapon').to(Katana).whenTargetTagged('canThrow', false);
    container.bind<Weapon>('Weapon').to(Shuriken).whenTargetTagged(Tag.CanThrow, true);

    const ninja = container.get<Warrior>('Warrior');
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it('Should support custom tag decorators', () => {

    interface Weapon { }

    @injectable()
    class Katana implements Weapon { }

    @injectable()
    class Shuriken implements Weapon { }

    interface Warrior {
      katana: Weapon;
      shuriken: Weapon;
    }

    const throwable = tagged('canThrow', true);
    const notThrowable = tagged('canThrow', false);

    @injectable()
    class Ninja implements Warrior {
      public katana: Weapon;
      public shuriken: Weapon;
      public constructor(
        @inject('Weapon') @notThrowable katana: Weapon,
        @inject('Weapon') @throwable shuriken: Weapon
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container = new Container();
    container.bind<Warrior>('Warrior').to(Ninja);
    container.bind<Weapon>('Weapon').to(Katana).whenTargetTagged('canThrow', false);
    container.bind<Weapon>('Weapon').to(Shuriken).whenTargetTagged('canThrow', true);

    const ninja = container.get<Warrior>('Warrior');
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it('Should support named bindings', () => {

    const name: symbol = Symbol.for('Weak');

    interface Weapon { }

    @injectable()
    class Katana implements Weapon { }

    @injectable()
    class Shuriken implements Weapon { }

    interface Warrior {
      katana: Weapon;
      shuriken: Weapon;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Weapon;
      public shuriken: Weapon;
      public constructor(
        @inject('Weapon') @named('strong') katana: Weapon,
        @inject('Weapon') @named(name) shuriken: Weapon
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container = new Container();
    container.bind<Warrior>('Warrior').to(Ninja);
    container.bind<Weapon>('Weapon').to(Katana).whenTargetNamed('strong');
    container.bind<Weapon>('Weapon').to(Shuriken).whenTargetNamed(name);

    const ninja = container.get<Warrior>('Warrior');
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it('Should support contextual bindings and targetName annotation', () => {

    interface Weapon { }

    @injectable()
    class Katana implements Weapon { }

    @injectable()
    class Shuriken implements Weapon { }

    interface Warrior {
      katana: Weapon;
      shuriken: Weapon;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Weapon;
      public shuriken: Weapon;
      public constructor(
        @inject('Weapon') @targetName('katana') katana: Weapon,
        @inject('Weapon') @targetName('shuriken') shuriken: Weapon
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container = new Container();
    container.bind<Warrior>('Warrior').to(Ninja);

    container.bind<Weapon>('Weapon').to(Katana).when((request: interfaces.Request) =>
      request !== null && request.target !== null && request.target.name.equals('katana'));

    container.bind<Weapon>('Weapon').to(Shuriken).when((request: interfaces.Request) =>
      request !== null && request.target !== null && request.target.name.equals('shuriken'));

    const ninja = container.get<Warrior>('Warrior');
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
      public constructor() {
        this.name = 'katana';
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      public constructor() {
        this.name = 'shuriken';
      }
    }

    const container = new Container();
    container.bind<Weapon>('Weapon').to(Katana).whenTargetNamed('japonese');
    container.bind<Weapon>('Weapon').to(Shuriken).whenTargetNamed('chinese');

    const katana = container.getNamed<Weapon>('Weapon', 'japonese');
    const shuriken = container.getNamed<Weapon>('Weapon', 'chinese');

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
      public constructor() {
        this.name = 'katana';
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      public constructor() {
        this.name = 'shuriken';
      }
    }

    const container = new Container();
    container.bind<Weapon>('Weapon').to(Katana).whenTargetTagged('faction', 'samurai');
    container.bind<Weapon>('Weapon').to(Shuriken).whenTargetTagged('faction', 'ninja');

    const katana = container.getTagged<Weapon>('Weapon', 'faction', 'samurai');
    const shuriken = container.getTagged<Weapon>('Weapon', 'faction', 'ninja');

    expect(katana.name).eql('katana');
    expect(shuriken.name).eql('shuriken');

  });

  it('Should be able to inject into a super constructor', () => {

    const SYMBOLS = {
      Samurai: Symbol.for('Samurai'),
      SamuraiMaster: Symbol.for('SamuraiMaster'),
      SamuraiMaster2: Symbol.for('SamuraiMaster2'),
      Weapon: Symbol.for('Weapon')
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
      public constructor() {
        this.name = 'katana';
      }
    }

    @injectable()
    class Samurai implements Warrior {

      public weapon: Weapon;

      public constructor(weapon: Weapon) {
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
      public constructor(@inject(SYMBOLS.Weapon) weapon: Weapon) {
        super(weapon);
        this.isMaster = true;
      }
    }

    const container = new Container();
    container.bind<Weapon>(SYMBOLS.Weapon).to(Katana);
    container.bind<Warrior>(SYMBOLS.Samurai).to(Samurai);
    container.bind<Warrior>(SYMBOLS.SamuraiMaster).to(SamuraiMaster);
    container.bind<Warrior>(SYMBOLS.SamuraiMaster2).to(SamuraiMaster2);

    const errorFunction = () => { container.get<Warrior>(SYMBOLS.SamuraiMaster); };
    const error = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH('SamuraiMaster');
    expect(errorFunction).to.throw(error);

    const samuraiMaster2 = container.get<SamuraiMaster2>(SYMBOLS.SamuraiMaster2);
    expect(samuraiMaster2.weapon.name).eql('katana');
    expect(typeof samuraiMaster2.isMaster).eql('boolean');

  });

  it('Should allow to flag arguments as unmanaged', () => {

    const container = new Container();

    // CASE 1: should throw

    const Base1Id = 'Base1';

    @injectable()
    class Base1 {
      public prop: string;
      public constructor(arg: string) {
        this.prop = arg;
      }
    }

    @injectable()
    class Derived1 extends Base1 {
      public constructor() {
        super('unmanaged-injected-value');
      }
    }

    container.bind<Base1>(Base1Id).to(Derived1);
    const tryGet = () => { container.get(Base1Id); };
    const error = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH('Derived1');
    expect(tryGet).to.throw(error);

    // CASE 2: Use @unmanaged to overcome issue

    const Base2Id = 'Base2';

    @injectable()
    class Base2 {
      public prop1: string;
      public constructor(@unmanaged() arg1: string) {
        this.prop1 = arg1;
      }
    }

    @injectable()
    class Derived2 extends Base2 {
      public constructor() {
        super('unmanaged-injected-value');
      }
    }

    container.bind<Base2>(Base2Id).to(Derived2);
    const derived1 = container.get<Base2>(Base2Id);
    expect(derived1 instanceof Derived2).to.eql(true);
    expect(derived1.prop1).to.eql('unmanaged-injected-value');

    // CASE 3: Use @unmanaged to overcome issue when multiple args

    const Base3Id = 'Base3';

    @injectable()
    class Base3 {
      public prop1: string;
      public prop2: string;
      public constructor(@unmanaged() arg1: string, arg2: string) {
        this.prop1 = arg1;
        this.prop2 = arg2;
      }
    }

    @injectable()
    class Derived3 extends Base3 {
      public constructor(@inject('SomeId') arg1: string) {
        super('unmanaged-injected-value', arg1);
      }
    }

    container.bind<Base3>(Base3Id).to(Derived3);
    container.bind<string>('SomeId').toConstantValue('managed-injected-value');
    const derived2 = container.get<Base3>(Base3Id);
    expect(derived2 instanceof Base3).to.eql(true);
    expect(derived2.prop1).to.eql('unmanaged-injected-value');
    expect(derived2.prop2).to.eql('managed-injected-value');

  });

  it('Should support a whenInjectedInto contextual bindings constraint', () => {

    const TYPES = {
      Ninja: 'Ninja',
      Weapon: 'Weapon'
    };

    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      public constructor() {
        this.name = 'katana';
      }
    }

    @injectable()
    class Bokken implements Weapon {
      public name: string;
      public constructor() {
        this.name = 'bokken';
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') @targetName('weapon') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') @targetName('weapon') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    const container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged('master', false);
    container.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenInjectedInto(NinjaMaster);
    container.bind<Weapon>(TYPES.Weapon).to(Bokken).whenInjectedInto(NinjaStudent);

    const master = container.getTagged<Ninja>(TYPES.Ninja, 'master', true);
    const student = container.getTagged<Ninja>(TYPES.Ninja, 'master', false);

    expect(master instanceof NinjaMaster).eql(true);
    expect(student instanceof NinjaStudent).eql(true);

    expect(master.weapon.name).eql('katana');
    expect(student.weapon.name).eql('bokken');

  });

  it('Should support a whenParentNamed contextual bindings constraint', () => {

    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon'
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      public constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      public constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      public constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') @named('non-lethal') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') @named('lethal') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    const container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged('master', false);
    container.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container.bind<Material>(TYPES.Material).to(Iron).whenParentNamed('lethal');
    container.bind<Material>(TYPES.Material).to(Wood).whenParentNamed('non-lethal');

    const master = container.getTagged<Ninja>(TYPES.Ninja, 'master', true);
    const student = container.getTagged<Ninja>(TYPES.Ninja, 'master', false);

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

  });

  it('Should support a whenParentTagged contextual bindings constraint', () => {

    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon'
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      public constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      public constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      public constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') @tagged('lethal', false) weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') @tagged('lethal', true) weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    const container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged('master', false);
    container.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container.bind<Material>(TYPES.Material).to(Iron).whenParentTagged('lethal', true);
    container.bind<Material>(TYPES.Material).to(Wood).whenParentTagged('lethal', false);

    const master = container.getTagged<Ninja>(TYPES.Ninja, 'master', true);
    const student = container.getTagged<Ninja>(TYPES.Ninja, 'master', false);

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

  });

  it('Should support a whenAnyAncestorIs and whenNoAncestorIs contextual bindings constraint', () => {

    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon'
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      public constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      public constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      public constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    // whenAnyAncestorIs
    const container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged('master', false);
    container.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container.bind<Material>(TYPES.Material).to(Iron).whenAnyAncestorIs(NinjaMaster);
    container.bind<Material>(TYPES.Material).to(Wood).whenAnyAncestorIs(NinjaStudent);

    const master = container.getTagged<Ninja>(TYPES.Ninja, 'master', true);
    const student = container.getTagged<Ninja>(TYPES.Ninja, 'master', false);

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorIs
    const container2 = new Container();
    container2.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged('master', false);
    container2.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged('master', true);
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2.bind<Material>(TYPES.Material).to(Iron).whenNoAncestorIs(NinjaStudent);
    container2.bind<Material>(TYPES.Material).to(Wood).whenNoAncestorIs(NinjaMaster);

    const master2 = container2.getTagged<Ninja>(TYPES.Ninja, 'master', true);
    const student2 = container2.getTagged<Ninja>(TYPES.Ninja, 'master', false);

    expect(master2.weapon.material.name).eql('iron');
    expect(student2.weapon.material.name).eql('wood');

  });

  it('Should support a whenAnyAncestorNamed and whenNoAncestorNamed contextual bindings constraint', () => {

    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon'
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      public constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      public constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      public constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    // whenAnyAncestorNamed
    const container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetNamed('non-lethal');
    container.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetNamed('lethal');
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container.bind<Material>(TYPES.Material).to(Iron).whenAnyAncestorNamed('lethal');
    container.bind<Material>(TYPES.Material).to(Wood).whenAnyAncestorNamed('non-lethal');

    const master = container.getNamed<Ninja>(TYPES.Ninja, 'lethal');
    const student = container.getNamed<Ninja>(TYPES.Ninja, 'non-lethal');

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorNamed
    const container2 = new Container();
    container2.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetNamed('non-lethal');
    container2.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetNamed('lethal');
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2.bind<Material>(TYPES.Material).to(Iron).whenNoAncestorNamed('non-lethal');
    container2.bind<Material>(TYPES.Material).to(Wood).whenNoAncestorNamed('lethal');

    const master2 = container.getNamed<Ninja>(TYPES.Ninja, 'lethal');
    const student2 = container.getNamed<Ninja>(TYPES.Ninja, 'non-lethal');

    expect(master2.weapon.material.name).eql('iron');
    expect(student2.weapon.material.name).eql('wood');

  });

  it('Should support a whenAnyAncestorTagged and whenNoAncestorTaggedcontextual bindings constraint', () => {

    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon'
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      public constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      public constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      public constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    // whenAnyAncestorTagged
    const container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged('lethal', false);
    container.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged('lethal', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container.bind<Material>(TYPES.Material).to(Iron).whenAnyAncestorTagged('lethal', true);
    container.bind<Material>(TYPES.Material).to(Wood).whenAnyAncestorTagged('lethal', false);

    const master = container.getTagged<Ninja>(TYPES.Ninja, 'lethal', true);
    const student = container.getTagged<Ninja>(TYPES.Ninja, 'lethal', false);

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorTagged
    const container2 = new Container();
    container2.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged('lethal', false);
    container2.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged('lethal', true);
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2.bind<Material>(TYPES.Material).to(Iron).whenNoAncestorTagged('lethal', false);
    container2.bind<Material>(TYPES.Material).to(Wood).whenNoAncestorTagged('lethal', true);

    const master2 = container.getTagged<Ninja>(TYPES.Ninja, 'lethal', true);
    const student2 = container.getTagged<Ninja>(TYPES.Ninja, 'lethal', false);

    expect(master2.weapon.material.name).eql('iron');
    expect(student2.weapon.material.name).eql('wood');

  });

  it('Should support a whenAnyAncestorMatches and whenNoAncestorMatches contextual bindings constraint', () => {

    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon'
    };

    interface Material {
      name: string;
    }

    @injectable()
    class Wood implements Material {
      public name: string;
      public constructor() {
        this.name = 'wood';
      }
    }

    @injectable()
    class Iron implements Material {
      public name: string;
      public constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    @injectable()
    class Sword implements Weapon {
      public material: Material;
      public constructor(@inject('Material') material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    @injectable()
    class NinjaStudent implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class NinjaMaster implements Ninja {

      public weapon: Weapon;

      public constructor(
        @inject('Weapon') weapon: Weapon
      ) {
        this.weapon = weapon;
      }
    }

    // custom constraints
    const anyAncestorIsNinjaMasterConstraint = typeConstraint(NinjaMaster);
    const anyAncestorIsNinjaStudentConstraint = typeConstraint(NinjaStudent);

    // whenAnyAncestorMatches
    const container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged('master', false);
    container.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged('master', true);
    container.bind<Weapon>(TYPES.Weapon).to(Sword);
    container.bind<Material>(TYPES.Material).to(Iron).whenAnyAncestorMatches(anyAncestorIsNinjaMasterConstraint);
    container.bind<Material>(TYPES.Material).to(Wood).whenAnyAncestorMatches(anyAncestorIsNinjaStudentConstraint);

    const master = container.getTagged<Ninja>(TYPES.Ninja, 'master', true);
    const student = container.getTagged<Ninja>(TYPES.Ninja, 'master', false);

    expect(master.weapon.material.name).eql('iron');
    expect(student.weapon.material.name).eql('wood');

    // whenNoAncestorMatches
    const container2 = new Container();
    container2.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged('master', false);
    container2.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged('master', true);
    container2.bind<Weapon>(TYPES.Weapon).to(Sword);
    container2.bind<Material>(TYPES.Material).to(Iron).whenNoAncestorMatches(anyAncestorIsNinjaStudentConstraint);
    container2.bind<Material>(TYPES.Material).to(Wood).whenNoAncestorMatches(anyAncestorIsNinjaMasterConstraint);

    const master2 = container2.getTagged<Ninja>(TYPES.Ninja, 'master', true);
    const student2 = container2.getTagged<Ninja>(TYPES.Ninja, 'master', false);

    expect(master2.weapon.material.name).eql('iron');
    expect(student2.weapon.material.name).eql('wood');

  });

  it('Should be able to inject a regular derived class', () => {

    const SYMBOLS = {
      RANK: Symbol.for('RANK'),
      SamuraiMaster: Symbol.for('SamuraiMaster')
    };

    interface Warrior {
      rank: string;
    }

    @injectable()
    class Samurai implements Warrior {

      public rank: string;

      public constructor(rank: string) {
        this.rank = rank;
      }
    }

    @injectable()
    class SamuraiMaster extends Samurai implements Warrior {
      public constructor(@inject(SYMBOLS.RANK) rank: string) {
        super(rank);
      }
    }

    const container = new Container();
    container.bind<Warrior>(SYMBOLS.SamuraiMaster).to(SamuraiMaster);
    container.bind<string>(SYMBOLS.RANK).toConstantValue('Master');

    const samurai = container.get<SamuraiMaster>(SYMBOLS.SamuraiMaster);
    expect(samurai.rank).eql('Master');

  });

  it('Should be able to identify missing @injectable in a base class', () => {

    const SYMBOLS = {
      SamuraiMaster: Symbol.for('SamuraiMaster')
    };

    interface Warrior {
      rank: string;
    }

    // IMPORTANT: Missing @injectable()
    class Samurai implements Warrior {

      public rank: string;

      public constructor(rank: string) {
        this.rank = rank;
      }
    }

    @injectable()
    class SamuraiMaster extends Samurai implements Warrior {
      public constructor() {
        super('master');
      }
    }

    const container = new Container();
    container.bind<Warrior>(SYMBOLS.SamuraiMaster).to(SamuraiMaster);

    function throws() {
      return container.get<Warrior>(SYMBOLS.SamuraiMaster);
    }

    expect(throws).to.throw(`${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} Samurai`);

  });

});
