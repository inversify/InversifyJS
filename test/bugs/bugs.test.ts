import { expect } from 'chai';

import * as ERROR_MSGS from '../../src/constants/error_msgs';
import * as METADATA_KEY from '../../src/constants/metadata_keys';
import {
  Container,
  decorate,
  inject,
  injectable,
  interfaces,
  multiInject,
  named,
  tagged,
  targetName,
  unmanaged,
} from '../../src/inversify';
import { Metadata } from '../../src/planning/metadata';
import { MetadataReader } from '../../src/planning/metadata_reader';
import { getDependencies } from '../../src/planning/reflection_utils';
import {
  getFunctionName,
  getServiceIdentifierAsString,
} from '../../src/utils/serialization';

describe('Bugs', () => {
  it('Should throw when args length of base and derived class not match', () => {
    @injectable()
    class Warrior {
      public rank: string;
      constructor(rank: string) {
        // length = 1
        this.rank = rank;
      }
    }

    @injectable()
    class SamuraiMaster extends Warrior {
      constructor() {
        // length = 0
        super('master');
      }
    }

    const container: Container = new Container();
    container.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);

    const shouldThrow: () => void = function () {
      container.get<SamuraiMaster>(SamuraiMaster);
    };

    const error: string = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH('SamuraiMaster');
    expect(shouldThrow).to.throw(error);
  });

  it('Should not throw when args length of base and derived class match (property setter)', () => {
    @injectable()
    class Warrior {
      public rank: string | null;
      constructor() {
        // length = 0
        this.rank = null;
      }
    }

    @injectable()
    class SamuraiMaster extends Warrior {
      constructor() {
        // length = 0
        super();
        this.rank = 'master';
      }
    }

    const container: Container = new Container();
    container.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
    const master: SamuraiMaster = container.get<SamuraiMaster>(SamuraiMaster);

    expect(master.rank).eql('master');
  });

  it('Should not throw when args length of base and derived class match', () => {
    // Injecting into the derived class

    @injectable()
    class Warrior {
      protected rank: string;
      constructor(rank: string) {
        // length = 1
        this.rank = rank;
      }
    }

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = { Rank: 'Rank' };

    @injectable()
    class SamuraiMaster extends Warrior {
      constructor(
        @inject(TYPES.Rank) @named('master') public override rank: string, // length = 1
      ) {
        super(rank);
      }
    }

    const container: Container = new Container();
    container.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
    container
      .bind<string>(TYPES.Rank)
      .toConstantValue('master')
      .whenTargetNamed('master');

    const master: SamuraiMaster = container.get<SamuraiMaster>(SamuraiMaster);
    expect(master.rank).eql('master');
  });

  it('Should not throw when args length of base and derived class match', () => {
    // Injecting into the derived class with multiple args

    @injectable()
    class Warrior {
      protected rank: string;
      constructor(rank: string) {
        // length = 1
        this.rank = rank;
      }
    }

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

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Rank: 'Rank',
      Weapon: 'Weapon',
    };

    @injectable()
    class SamuraiMaster extends Warrior {
      public weapon: Weapon;
      constructor(
        @inject(TYPES.Rank) @named('master') public override rank: string,
        @inject(TYPES.Weapon) weapon: Weapon,
      ) {
        // length = 2
        super(rank);
        this.weapon = weapon;
      }
    }

    const container: Container = new Container();
    container.bind<Weapon>(TYPES.Weapon).to(Katana);
    container.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
    container
      .bind<string>(TYPES.Rank)
      .toConstantValue('master')
      .whenTargetNamed('master');

    const master: SamuraiMaster = container.get<SamuraiMaster>(SamuraiMaster);
    expect(master.rank).eql('master');
    expect(master.weapon.name).eql('Katana');
  });

  it('Should be able to convert a Symbol value to a string', () => {
    type Weapon = unknown;

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Weapon: Symbol.for('Weapon'),
    };

    const container: Container = new Container();
    const throwF: () => void = () => {
      container.get<Weapon>(TYPES.Weapon);
    };
    expect(throwF).to.throw(
      `${ERROR_MSGS.NOT_REGISTERED} ${getServiceIdentifierAsString(TYPES.Weapon)}`,
    );
  });

  it('Should be not require @inject annotation in toConstructor bindings', () => {
    type CategorySortingFn = unknown;
    type ContentSortingFn = unknown;
    type Collection = unknown;

    @injectable()
    class Category {
      constructor(
        public id: string,
        public title: string,
        public categoryFirstPermalink: string,
        public categoryPermalink: string,
        public pagination: number,
        public categorySortingFn: CategorySortingFn,
        public contentSortingFn: ContentSortingFn,
        public belongsToCollection: Collection,
      ) {
        // do nothing
      }
    }

    const container: Container = new Container();
    container
      .bind<interfaces.Newable<Category>>('Newable<Category>')
      .toConstructor(Category);
    const expected: interfaces.Newable<Category> =
      container.get<interfaces.Newable<Category>>('Newable<Category>');
    expect(expected).eql(Category);
  });

  it('Should be able to combine tagged injection and constant value bindings', () => {
    const container: Container = new Container();

    type Intl = unknown;

    container
      .bind<Intl>('Intl')
      .toConstantValue({ hello: 'bonjour' })
      .whenTargetTagged('lang', 'fr');
    container
      .bind<Intl>('Intl')
      .toConstantValue({ goodbye: 'au revoir' })
      .whenTargetTagged('lang', 'fr');

    const f: () => void = function () {
      container.getTagged<Intl>('Intl', 'lang', 'fr');
    };
    expect(f).to.throw();
  });

  it('Should be able to combine dynamic value with singleton scope', () => {
    const container: Container = new Container();

    container
      .bind<number>('transient_random')
      .toDynamicValue((_context: interfaces.Context) => Math.random())
      .inTransientScope();

    container
      .bind<number>('singleton_random')
      .toDynamicValue((_context: interfaces.Context) => Math.random())
      .inSingletonScope();

    const a: number = container.get<number>('transient_random');
    const b: number = container.get<number>('transient_random');

    expect(a).not.to.eql(b);

    const c: number = container.get<number>('singleton_random');
    const d: number = container.get<number>('singleton_random');

    expect(c).to.eql(d);
  });

  it('Should be able to use an abstract class as the serviceIdentifier', () => {
    @injectable()
    abstract class Animal {
      protected name: string;
      constructor(@unmanaged() name: string) {
        this.name = name;
      }
      public move(meters: number) {
        return `${this.name} moved ${meters.toString()}m`;
      }
      public abstract makeSound(input: string): string;
    }

    @injectable()
    class Snake extends Animal {
      constructor() {
        super('Snake');
      }
      public makeSound(input: string): string {
        return 'sssss' + input;
      }
      public override move() {
        return 'Slithering... ' + super.move(5);
      }
    }

    @injectable()
    class Jungle {
      public animal: Animal;
      constructor(@inject(Animal) animal: Animal) {
        this.animal = animal;
      }
    }

    const container: Container = new Container();
    container.bind<Animal>(Animal).to(Snake);
    container.bind<Jungle>(Jungle).to(Jungle);

    const jungle: Jungle = container.get(Jungle);
    expect(jungle.animal.makeSound('zzz')).to.eql('ssssszzz');

    expect(jungle.animal.move(5)).to.eql('Slithering... Snake moved 5m');
  });

  it('Should be able to identify is a target is tagged', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Dependency1: Symbol.for('Dependency1'),
      Dependency2: Symbol.for('Dependency2'),
      Dependency3: Symbol.for('Dependency3'),
      Dependency4: Symbol.for('Dependency4'),
      Dependency5: Symbol.for('Dependency5'),
      Test: Symbol.for('Test'),
    };

    // eslint-disable-next-line @typescript-eslint/typedef
    const TAGS = {
      somename: 'somename',
      sometag: 'sometag',
    };

    @injectable()
    class Dependency1 {
      public name: string = 'Dependency1';
    }

    @injectable()
    class Dependency2 {
      public name: string = 'Dependency1';
    }

    @injectable()
    class Dependency3 {
      public name: string = 'Dependency1';
    }

    @injectable()
    class Dependency4 {
      public name: string = 'Dependency1';
    }

    @injectable()
    class Dependency5 {
      public name: string = 'Dependency1';
    }

    @injectable()
    class Base {
      public baseProp: string;
      constructor(@unmanaged() baseProp: string) {
        this.baseProp = baseProp;
      }
    }

    @injectable()
    class Test extends Base {
      private readonly _prop1: Dependency1;
      private readonly _prop2: Dependency2[];
      private readonly _prop3: Dependency3;
      private readonly _prop4: Dependency4;
      private readonly _prop5: Dependency5;

      constructor(
        @inject(TYPES.Dependency1) prop1: Dependency1, // inject
        @multiInject(TYPES.Dependency2) prop2: Dependency2[], // multi inject
        @inject(TYPES.Dependency3) @named(TAGS.somename) prop3: Dependency3, // named
        @inject(TYPES.Dependency4)
        @tagged(TAGS.sometag, true)
        prop4: Dependency4, // tagged
        @inject(TYPES.Dependency5) @targetName('prop6') prop5: Dependency5, // targetName
      ) {
        super('unmanaged!');
        this._prop1 = prop1;
        this._prop2 = prop2;
        this._prop3 = prop3;
        this._prop4 = prop4;
        this._prop5 = prop5;
      }
      public debug() {
        return {
          prop1: this._prop1,
          prop2: this._prop2,
          prop3: this._prop3,
          prop4: this._prop4,
          prop5: this._prop5,
        };
      }
    }

    const container: Container = new Container();
    container.bind<Test>(TYPES.Test).to(Test);
    container.bind<Dependency1>(TYPES.Dependency1).to(Dependency1);
    container.bind<Dependency2>(TYPES.Dependency2).to(Dependency2);
    container.bind<Dependency3>(TYPES.Dependency3).to(Dependency3);
    container.bind<Dependency4>(TYPES.Dependency4).to(Dependency4);
    container.bind<Dependency5>(TYPES.Dependency5).to(Dependency5);

    function logger(next: interfaces.Next): interfaces.Next {
      return (args: interfaces.NextArgs) => {
        const nextContextInterceptor: (
          contexts: interfaces.Context,
        ) => interfaces.Context = args.contextInterceptor;

        args.contextInterceptor = (context: interfaces.Context) => {
          context.plan.rootRequest.childRequests.forEach(
            (request: interfaces.Request | null, index: number) => {
              if (
                request === null ||
                (request.target as interfaces.Target | null) === null
              ) {
                throw new Error('Request should not be null!');
              }

              switch (index) {
                case 0:
                  expect(request.target.isNamed()).to.eql(false);
                  expect(request.target.isTagged()).to.eql(false);
                  break;
                case 1:
                  expect(request.target.isNamed()).to.eql(false);
                  expect(request.target.isTagged()).to.eql(false);
                  break;

                case 2:
                  expect(request.target.isNamed()).to.eql(true);
                  expect(request.target.isTagged()).to.eql(false);
                  break;

                case 3:
                  expect(request.target.isNamed()).to.eql(false);
                  expect(request.target.isTagged()).to.eql(true);
                  break;

                case 4:
                  expect(request.target.isNamed()).to.eql(false);
                  expect(request.target.isTagged()).to.eql(false);
              }
            },
          );

          return nextContextInterceptor(context);
        };

        const result: unknown = next(args);

        return result;
      };
    }

    container.applyMiddleware(logger);
    container.get<Test>(TYPES.Test);
  });

  it('Helper getFunctionName should not throw when using an anonymous function', () => {
    const anonymousFunctionBuilder: () => (options: unknown) => unknown =
      () =>
      (options: unknown): unknown => {
        return options;
      };

    const name: string = getFunctionName(anonymousFunctionBuilder());

    expect(name).to.eql(
      'Anonymous function: ' + anonymousFunctionBuilder().toString(),
    );
  });

  it('Should be able to get all the available bindings for a service identifier', () => {
    const controllerId: string = 'SomeControllerID';
    const tagA: string = 'A';
    const tagB: string = 'B';

    interface Controller {
      name: string;
    }

    const container: Container = new Container();

    @injectable()
    class AppController implements Controller {
      public name: string;
      constructor() {
        this.name = 'AppController';
      }
    }

    @injectable()
    class AppController2 implements Controller {
      public name: string;
      constructor() {
        this.name = 'AppController2';
      }
    }

    container.bind(controllerId).to(AppController).whenTargetNamed(tagA);
    container.bind(controllerId).to(AppController2).whenTargetNamed(tagB);

    function wrongNamedBinding() {
      container.getAllNamed<Controller>(controllerId, 'Wrong');
    }
    expect(wrongNamedBinding).to.throw();

    const appControllerNamedRight: Controller[] =
      container.getAllNamed<Controller>(controllerId, tagA);
    expect(appControllerNamedRight.length).to.eql(1, 'getAllNamed');
    expect(appControllerNamedRight[0]?.name).to.eql('AppController');

    function wrongTaggedBinding() {
      container.getAllTagged<Controller>(controllerId, 'Wrong', 'Wrong');
    }
    expect(wrongTaggedBinding).to.throw();

    const appControllerTaggedRight: Controller[] =
      container.getAllTagged<Controller>(
        controllerId,
        METADATA_KEY.NAMED_TAG,
        tagB,
      );
    expect(appControllerTaggedRight.length).to.eql(1, 'getAllTagged');
    expect(appControllerTaggedRight[0]?.name).to.eql('AppController2');

    const getAppController: () => void = () => {
      const matches: Controller[] = container.getAll<Controller>(controllerId);

      expect(matches.length).to.eql(2);
      expect(matches[0]?.name).to.eql('AppController');
      expect(matches[1]?.name).to.eql('AppController2');
    };

    expect(getAppController).not.to.throw();
  });

  it('Should not be able to get a named dependency if no named bindings are registered', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Weapon: 'Weapon',
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

    const container: Container = new Container();
    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetNamed('sword');

    const throws: () => void = () => {
      container.getNamed<Weapon>(TYPES.Weapon, 'bow');
    };

    const error: string = `No matching bindings found for serviceIdentifier: Weapon
 Weapon - {"key":"named","value":"bow"}

Registered bindings:
 Katana - named: sword`;

    expect(throws).to.throw(error);
  });

  it('Should throw a friendly error when binding a non-class using toSelf', () => {
    const container: Container = new Container();
    const throws: () => void = () => {
      container.bind('testId').toSelf();
    };
    expect(throws).to.throw(ERROR_MSGS.INVALID_TO_SELF_VALUE);
  });

  it('Should generate correct metadata when the spread operator is used', () => {
    const BAR: symbol = Symbol.for('BAR');
    const FOO: symbol = Symbol.for('FOO');

    interface Bar {
      name: string;
    }

    @injectable()
    class Foo {
      public bar: Bar[];
      constructor(@multiInject(BAR) ...args: Bar[][]) {
        this.bar = args[0] as Bar[];
      }
    }

    // is the metadata correct?
    const serviceIdentifiers: interfaces.MetadataMap = Reflect.getMetadata(
      METADATA_KEY.TAGGED,
      Foo,
    ) as interfaces.MetadataMap;

    const zeroIndexedMetadata: interfaces.Metadata[] = serviceIdentifiers[
      '0'
    ] as interfaces.Metadata[];

    const expectedMetadata: interfaces.Metadata = new Metadata(
      METADATA_KEY.MULTI_INJECT_TAG,
      BAR,
    );

    expect(zeroIndexedMetadata).to.deep.equal([expectedMetadata]);

    // is the plan correct?
    const dependencies: interfaces.Target[] = getDependencies(
      new MetadataReader(),
      Foo,
    );
    expect(dependencies.length).to.be.eql(1);
    expect(dependencies[0]?.serviceIdentifier.toString()).to.be.eql(
      'Symbol(BAR)',
    );

    // integration test
    const container: Container = new Container();
    container.bind<Bar>(BAR).toConstantValue({ name: 'bar1' });
    container.bind<Bar>(BAR).toConstantValue({ name: 'bar2' });
    container.bind<Foo>(FOO).to(Foo);
    const foo: Foo = container.get<Foo>(FOO);

    expect(foo.bar.length).to.eql(2);
    expect(foo.bar[0]?.name).to.eql('bar1');
    expect(foo.bar[1]?.name).to.eql('bar2');
  });

  it('Should be able to inject into an abstract class', () => {
    type Weapon = unknown;

    @injectable()
    abstract class BaseSoldier {
      public weapon: Weapon;
      constructor(@inject('Weapon') weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    @injectable()
    class Soldier extends BaseSoldier {}

    @injectable()
    class Archer extends BaseSoldier {}

    @injectable()
    class Knight extends BaseSoldier {}

    @injectable()
    class Sword {}

    @injectable()
    class Bow {}

    @injectable()
    class DefaultWeapon {}

    const container: Container = new Container();

    container
      .bind<Weapon>('Weapon')
      .to(DefaultWeapon)
      .whenInjectedInto(Soldier);
    container.bind<Weapon>('Weapon').to(Sword).whenInjectedInto(Knight);
    container.bind<Weapon>('Weapon').to(Bow).whenInjectedInto(Archer);
    container
      .bind<BaseSoldier>('BaseSoldier')
      .to(Soldier)
      .whenTargetNamed('default');
    container
      .bind<BaseSoldier>('BaseSoldier')
      .to(Knight)
      .whenTargetNamed('knight');
    container
      .bind<BaseSoldier>('BaseSoldier')
      .to(Archer)
      .whenTargetNamed('archer');

    const soldier: BaseSoldier = container.getNamed<BaseSoldier>(
      'BaseSoldier',
      'default',
    );
    const knight: BaseSoldier = container.getNamed<BaseSoldier>(
      'BaseSoldier',
      'knight',
    );
    const archer: BaseSoldier = container.getNamed<BaseSoldier>(
      'BaseSoldier',
      'archer',
    );

    expect(soldier.weapon instanceof DefaultWeapon).to.eql(true);
    expect(knight.weapon instanceof Sword).to.eql(true);
    expect(archer.weapon instanceof Bow).to.eql(true);
  });

  it('Should be able apply inject to property shortcut', () => {
    interface Weapon {
      use(): string;
    }

    @injectable()
    class Katana implements Weapon {
      public use() {
        return 'Used Katana!';
      }
    }

    @injectable()
    class Ninja {
      constructor(
        @inject('Weapon') @named('sword') private readonly _weapon: Weapon,
      ) {
        //
      }
      public fight() {
        return this._weapon.use();
      }
    }

    const container: Container = new Container();
    container.bind<Weapon>('Weapon').to(Katana).whenTargetNamed('sword');
    container.bind<Ninja>(Ninja).toSelf();

    const ninja: Ninja = container.get<Ninja>(Ninja);
    expect(ninja.fight()).eql('Used Katana!');
  });

  it('Should be able to inject into abstract base class without decorators', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Warrior: 'Warrior',
      Weapon: 'Weapon',
    };

    // eslint-disable-next-line @typescript-eslint/typedef
    const TAGS = {
      Primary: 'Primary',
      Priority: 'Priority',
      Secondary: 'Secondary',
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

    interface Warrior {
      name: string;
      primaryWeapon: Weapon;
    }

    abstract class BaseWarrior implements Warrior {
      public name: string;
      public primaryWeapon!: Weapon;

      constructor(@unmanaged() name: string) {
        this.name = name;
      }
    }

    // @injectable()
    decorate(injectable(), BaseWarrior);

    // @inject(TYPES.Weapon)
    inject(TYPES.Weapon)(BaseWarrior.prototype, 'primaryWeapon');

    // @tagged(TAGS.Priority, TAGS.Primary)
    tagged(TAGS.Priority, TAGS.Primary)(BaseWarrior.prototype, 'primaryWeapon');

    @injectable()
    class Samurai extends BaseWarrior {
      @inject(TYPES.Weapon)
      @tagged(TAGS.Priority, TAGS.Secondary)
      public secondaryWeapon!: Weapon;

      constructor() {
        super('Samurai');
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>(TYPES.Warrior).to(Samurai);
    container
      .bind<Weapon>(TYPES.Weapon)
      .to(Katana)
      .whenTargetTagged(TAGS.Priority, TAGS.Primary);
    container
      .bind<Weapon>(TYPES.Weapon)
      .to(Shuriken)
      .whenTargetTagged(TAGS.Priority, TAGS.Secondary);

    const samurai: Samurai = container.get<Samurai>(TYPES.Warrior);

    expect(samurai.name).to.eql('Samurai');
    expect(samurai.secondaryWeapon).not.to.eql(undefined);
    expect(samurai.secondaryWeapon.name).to.eql('Shuriken');
    expect(samurai.primaryWeapon).not.to.eql(undefined);
    expect(samurai.primaryWeapon.name).to.eql('Katana');
  });

  it('Should be able to combine unmanaged and managed injections ', () => {
    interface Model<T> {
      instance: T;
    }

    interface RepoBaseInterface<T> {
      model: Model<T>;
    }

    class Type {
      public name: string;
      constructor() {
        this.name = 'Type';
      }
    }

    @injectable()
    class RepoBase<T> implements RepoBaseInterface<T> {
      public model: Model<T>;

      constructor(
        // using @unmanaged() here is right
        // because entityType is NOT Injected by inversify
        @unmanaged() entityType: new () => T,
      ) {
        this.model = { instance: new entityType() };
      }
    }

    @injectable()
    class TypedRepo extends RepoBase<Type> {
      constructor() {
        super(Type); // unmanaged injection (NOT Injected by inversify)
      }
    }

    @injectable()
    class BlBase<T> {
      public repository: RepoBaseInterface<T>;

      constructor(
        // using @unmanaged() here would wrong
        // because repository is injected by inversify
        repository: RepoBaseInterface<T>,
      ) {
        this.repository = repository;
      }
    }

    @injectable()
    class TypedBl extends BlBase<Type> {
      // eslint-disable-next-line @typescript-eslint/no-useless-constructor
      constructor(repository: TypedRepo) {
        super(repository);
      }
    }

    const container: Container = new Container();
    container.bind<TypedRepo>(TypedRepo).toSelf();
    container.bind<TypedBl>('TypedBL').to(TypedBl);

    const typedBl: TypedBl = container.get<TypedBl>('TypedBL');
    expect(typedBl.repository.model.instance.name).to.eq(new Type().name);
  });

  it('Should allow missing annotations in base classes', () => {
    @injectable()
    class Katana implements Katana {
      public hit() {
        return 'cut!';
      }
    }

    abstract class Warrior {
      private readonly _katana: Katana;

      constructor(@unmanaged() katana: Katana) {
        this._katana = katana;
      }

      public fight() {
        return this._katana.hit();
      }
    }

    @injectable()
    class Ninja extends Warrior {
      constructor(@inject('Katana') katana: Katana) {
        super(katana);
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>('Ninja').to(Ninja);
    container.bind<Katana>('Katana').to(Katana);

    const tryGet: () => void = () => {
      container.get<Ninja>('Ninja');
    };

    expect(tryGet).not.to.throw();
  });
});
