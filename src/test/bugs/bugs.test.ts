import { expect } from 'chai';

import {
  BindingMetadata,
  Container,
  decorate,
  inject,
  injectable,
  injectFromBase,
  MetadataName,
  named,
  ServiceIdentifier,
  tagged,
  unmanaged,
} from '../..';

describe('Bugs', () => {
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
      .whenNamed('master');

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
      .whenNamed('master');

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

    expect(throwF).to.throw('');
  });

  it('Should be able to combine tagged injection and constant value bindings', () => {
    const container: Container = new Container();

    type Intl = unknown;

    container
      .bind<Intl>('Intl')
      .toConstantValue({ hello: 'bonjour' })
      .whenTagged('lang', 'fr');
    container
      .bind<Intl>('Intl')
      .toConstantValue({ goodbye: 'au revoir' })
      .whenTagged('lang', 'fr');

    const f: () => void = function () {
      container.get<Intl>('Intl', {
        tag: {
          key: 'lang',
          value: 'fr',
        },
      });
    };
    expect(f).to.throw();
  });

  it('Should be able to combine dynamic value with singleton scope', () => {
    const container: Container = new Container();

    container
      .bind<number>('transient_random')
      .toDynamicValue(() => Math.random())
      .inTransientScope();

    container
      .bind<number>('singleton_random')
      .toDynamicValue(() => Math.random())
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
    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenNamed('sword');

    const throws: () => void = () => {
      container.get<Weapon>(TYPES.Weapon, {
        name: 'bow',
      });
    };

    const error: string = `No bindings found for service: "Weapon".

Trying to resolve bindings for "Weapon (Root service)"`;

    expect(throws).to.throw(error);
  });

  it('Should throw a friendly error when binding a non-class using toSelf', () => {
    const container: Container = new Container();
    const throws: () => void = () => {
      container.bind('testId').toSelf();
    };
    expect(throws).to.throw('');
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
    @injectFromBase({
      extendConstructorArguments: true,
    })
    class Soldier extends BaseSoldier {}

    @injectable()
    @injectFromBase({
      extendConstructorArguments: true,
    })
    class Archer extends BaseSoldier {}

    @injectable()
    @injectFromBase({
      extendConstructorArguments: true,
    })
    class Knight extends BaseSoldier {}

    @injectable()
    class Sword {}

    @injectable()
    class Bow {}

    @injectable()
    class DefaultWeapon {}

    const container: Container = new Container();

    function whenIsAndIsNamed(
      serviceIdentifier: ServiceIdentifier,
      name: MetadataName,
    ): (bindingMetadata: BindingMetadata) => boolean {
      return (bindingMetadata: BindingMetadata): boolean =>
        bindingMetadata.serviceIdentifier === serviceIdentifier &&
        bindingMetadata.name === name;
    }

    container
      .bind<Weapon>('Weapon')
      .to(DefaultWeapon)
      .whenParent(whenIsAndIsNamed('BaseSoldier', 'default'));
    container
      .bind<Weapon>('Weapon')
      .to(Sword)
      .whenParent(whenIsAndIsNamed('BaseSoldier', 'knight'));
    container
      .bind<Weapon>('Weapon')
      .to(Bow)
      .whenParent(whenIsAndIsNamed('BaseSoldier', 'archer'));
    container.bind<BaseSoldier>('BaseSoldier').to(Soldier).whenNamed('default');
    container.bind<BaseSoldier>('BaseSoldier').to(Knight).whenNamed('knight');
    container.bind<BaseSoldier>('BaseSoldier').to(Archer).whenNamed('archer');

    const soldier: BaseSoldier = container.get<BaseSoldier>('BaseSoldier', {
      name: 'default',
    });
    const knight: BaseSoldier = container.get<BaseSoldier>('BaseSoldier', {
      name: 'knight',
    });
    const archer: BaseSoldier = container.get<BaseSoldier>('BaseSoldier', {
      name: 'archer',
    });

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
    container.bind<Weapon>('Weapon').to(Katana).whenNamed('sword');
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
    decorate([injectable()], BaseWarrior);

    // @inject(TYPES.Weapon)
    inject(TYPES.Weapon)(BaseWarrior.prototype, 'primaryWeapon');

    // @tagged(TAGS.Priority, TAGS.Primary)
    tagged(TAGS.Priority, TAGS.Primary)(BaseWarrior.prototype, 'primaryWeapon');

    @injectable()
    @injectFromBase({
      extendProperties: true,
    })
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
      .whenTagged(TAGS.Priority, TAGS.Primary);
    container
      .bind<Weapon>(TYPES.Weapon)
      .to(Shuriken)
      .whenTagged(TAGS.Priority, TAGS.Secondary);

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
