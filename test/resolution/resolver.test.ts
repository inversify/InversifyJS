import { expect } from 'chai';
import * as sinon from 'sinon';

import { inject } from '../../src/annotation/inject';
import { injectable } from '../../src/annotation/injectable';
import { multiInject } from '../../src/annotation/multi_inject';
import { named } from '../../src/annotation/named';
import { postConstruct } from '../../src/annotation/post_construct';
import { preDestroy } from '../../src/annotation/pre_destroy';
import { tagged } from '../../src/annotation/tagged';
import { targetName } from '../../src/annotation/target_name';
import * as ERROR_MSGS from '../../src/constants/error_msgs';
import { BindingTypeEnum, TargetTypeEnum } from '../../src/constants/literal_types';
import { Container } from '../../src/container/container';
import { interfaces } from '../../src/interfaces/interfaces';
import { MetadataReader } from '../../src/planning/metadata_reader';
import { getBindingDictionary, plan } from '../../src/planning/planner';
import { resolveInstance } from '../../src/resolution/instantiation';
import { resolve } from '../../src/resolution/resolver';

function resolveTyped<T>(context: interfaces.Context) {
  return resolve(context) as T
}

describe('Resolve', () => {

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should be able to resolve BindingType.Instance bindings', () => {

    const ninjaId = 'Ninja';
    const shurikenId = 'Shuriken';
    const katanaId = 'Katana';
    const katanaHandlerId = 'KatanaHandler';
    const katanaBladeId = 'KatanaBlade';

    interface Blade { }

    @injectable()
    class KatanaBlade implements Blade { }

    interface Handler { }

    @injectable()
    class KatanaHandler implements Handler { }

    interface Sword {
      handler: KatanaHandler;
      blade: KatanaBlade;
    }

    @injectable()
    class Katana implements Sword {
      public handler: Handler;
      public blade: Blade;
      public constructor(
        @inject(katanaHandlerId) @targetName('handler') handler: Handler,
        @inject(katanaBladeId) @targetName('blade') blade: Blade
      ) {
        this.handler = handler;
        this.blade = blade;
      }
    }

    interface Shuriken { }

    @injectable()
    class Shuriken implements Shuriken { }

    interface Warrior {
      katana: Katana;
      shuriken: Shuriken;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Katana;
      public shuriken: Shuriken;
      public constructor(
        @inject(katanaId) @targetName('katana') katana: Katana,
        @inject(shurikenId) @targetName('shuriken') shuriken: Shuriken
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Shuriken>(shurikenId).to(Shuriken);
    container.bind<Katana>(katanaId).to(Katana);
    container.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
    container.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler);

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);
    const ninja = resolveTyped<Ninja>(context);

    expect(ninja instanceof Ninja).eql(true);
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
    expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it('Should store singleton type bindings in cache', () => {

    const ninjaId = 'Ninja';
    const shurikenId = 'Shuriken';
    const katanaId = 'Katana';
    const katanaHandlerId = 'KatanaHandler';
    const katanaBladeId = 'KatanaBlade';

    interface Blade { }

    @injectable()
    class KatanaBlade implements Blade { }

    interface Handler { }

    @injectable()
    class KatanaHandler implements Handler { }

    interface Sword {
      handler: KatanaHandler;
      blade: KatanaBlade;
    }

    @injectable()
    class Katana implements Sword {
      public handler: Handler;
      public blade: Blade;
      public constructor(
        @inject(katanaHandlerId) @targetName('handler') handler: Handler,
        @inject(katanaBladeId) @targetName('blade') blade: Blade
      ) {
        this.handler = handler;
        this.blade = blade;
      }
    }

    interface Shuriken { }

    @injectable()
    class Shuriken implements Shuriken { }

    interface Warrior {
      katana: Katana;
      shuriken: Shuriken;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Katana;
      public shuriken: Shuriken;
      public constructor(
        @inject(katanaId) @targetName('katana') katana: Katana,
        @inject(shurikenId) @targetName('shuriken') shuriken: Shuriken
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Shuriken>(shurikenId).to(Shuriken);
    container.bind<Katana>(katanaId).to(Katana).inSingletonScope(); // SINGLETON!
    container.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
    container.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler).inSingletonScope(); // SINGLETON!

    const bindingDictionary = getBindingDictionary(container);
    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const katanaBinding = bindingDictionary.get(katanaId)[0];
    expect(katanaBinding?.cache === null).eql(true);
    expect(katanaBinding?.activated).eql(false);

    const ninja = resolveTyped<Ninja>(context);
    expect(ninja instanceof Ninja).eql(true);

    const ninja2 = resolveTyped<Ninja>(context);
    expect(ninja2 instanceof Ninja).eql(true);

    expect(katanaBinding?.cache instanceof Katana).eql(true);
    expect(katanaBinding?.activated).eql(true);

  });

  it('Should throw when an invalid BindingType is detected', () => {

    interface Katana { }

    @injectable()
    class Katana implements Katana { }

    interface Shuriken { }

    @injectable()
    class Shuriken implements Shuriken { }

    interface Warrior {
      katana: Katana;
      shuriken: Shuriken;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Katana;
      public shuriken: Shuriken;
      public constructor(
        @inject('Katana') @targetName('katana') katana: Katana,
        @inject('Shuriken') @targetName('shuriken') shuriken: Shuriken
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    // container and bindings
    const ninjaId = 'Ninja';
    const container = new Container();
    container.bind<Ninja>(ninjaId); // IMPORTANT! (Invalid binding)

    // context and plan
    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const throwFunction = () => {
      resolveTyped(context);
    };

    expect(context.plan.rootRequest.bindings[0]?.type).eql(BindingTypeEnum.Invalid);
    expect(throwFunction).to.throw(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${ninjaId}`);

  });

  it('Should be able to resolve BindingType.ConstantValue bindings', () => {

    interface KatanaBlade { }

    @injectable()
    class KatanaBlade implements KatanaBlade { }

    interface KatanaHandler { }

    @injectable()
    class KatanaHandler implements KatanaHandler { }

    interface Sword {
      handler: KatanaHandler;
      blade: KatanaBlade;
    }

    @injectable()
    class Katana implements Sword {
      public handler: KatanaHandler;
      public blade: KatanaBlade;
      public constructor(handler: KatanaHandler, blade: KatanaBlade) {
        this.handler = handler;
        this.blade = blade;
      }
    }

    interface Shuriken { }

    @injectable()
    class Shuriken implements Shuriken { }

    interface Warrior {
      katana: Katana;
      shuriken: Shuriken;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Katana;
      public shuriken: Shuriken;
      public constructor(
        @inject('Katana') @targetName('katana') katana: Katana,
        @inject('Shuriken') @targetName('shuriken') shuriken: Shuriken
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const ninjaId = 'Ninja';
    const shurikenId = 'Shuriken';
    const katanaId = 'Katana';

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Shuriken>(shurikenId).to(Shuriken);
    container.bind<Katana>(katanaId).toConstantValue(new Katana(new KatanaHandler(), new KatanaBlade())); // IMPORTANT!

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const katanaBinding = getBindingDictionary(container).get(katanaId)[0];
    expect(katanaBinding?.activated).eql(false);

    const ninja = resolveTyped<Ninja>(context);

    expect(katanaBinding?.activated).eql(true);

    expect(ninja instanceof Ninja).eql(true);
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
    expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it('Should be able to resolve BindingType.DynamicValue bindings', () => {

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

  it('Should be able to resolve BindingType.Constructor bindings', () => {

    const ninjaId = 'Ninja';
    const newableKatanaId = 'Newable<Katana>';
    @injectable()
    class Katana { }

    @injectable()
    class Ninja {
      public katana: Katana;
      public constructor(
        @inject(newableKatanaId) katana: interfaces.Newable<Katana>
      ) {
        this.katana = new katana();  // IMPORTANT!
      }
    }

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<interfaces.Newable<Katana>>(newableKatanaId).toConstructor<Katana>(Katana);  // IMPORTANT!

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);
    const ninja = resolveTyped<Ninja>(context);

    expect(ninja instanceof Ninja).eql(true);
    expect(ninja.katana instanceof Katana).eql(true);

  });

  it('Should be able to resolve BindingType.Factory bindings', () => {

    const ninjaId = 'Ninja';
    const shurikenId = 'Shuriken';
    const swordFactoryId = 'Factory<Sword>';
    const katanaId = 'Katana';
    const handlerId = 'Handler';
    const bladeId = 'Blade';

    interface Blade { }

    @injectable()
    class KatanaBlade implements Blade { }

    interface Handler { }

    @injectable()
    class KatanaHandler implements Handler { }

    interface Sword {
      handler: Handler;
      blade: Blade;
    }

    type SwordFactory = () => Sword;

    @injectable()
    class Katana implements Sword {
      public handler: Handler;
      public blade: Blade;
      public constructor(
        @inject(handlerId) @targetName('handler') handler: Handler,
        @inject(bladeId) @targetName('blade') blade: Blade
      ) {
        this.handler = handler;
        this.blade = blade;
      }
    }

    interface Shuriken { }

    @injectable()
    class Shuriken implements Shuriken { }

    interface Warrior {
      katana: Katana;
      shuriken: Shuriken;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Katana;
      public shuriken: Shuriken;
      public constructor(
        @inject(swordFactoryId) @targetName('makeKatana') makeKatana: SwordFactory,
        @inject(shurikenId) @targetName('shuriken') shuriken: Shuriken
      ) {
        this.katana = makeKatana(); // IMPORTANT!
        this.shuriken = shuriken;
      }
    }

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Shuriken>(shurikenId).to(Shuriken);
    container.bind<Katana>(katanaId).to(Katana);
    container.bind<KatanaBlade>(bladeId).to(KatanaBlade);
    container.bind<KatanaHandler>(handlerId).to(KatanaHandler);

    container.bind<interfaces.Factory<Katana>>(swordFactoryId).toFactory<Katana>((theContext: interfaces.Context) =>
      () =>
        theContext.container.get<Katana>(katanaId));

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const ninja = resolveTyped<Ninja>(context);

    expect(ninja instanceof Ninja).eql(true);
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
    expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it('Should be able to resolve bindings with auto factory', () => {

    const ninjaId = 'Ninja';
    const shurikenId = 'Shuriken';
    const katanaFactoryId = 'Factory<Sword>';
    const katanaId = 'Katana';
    const katanaHandlerId = 'KatanaHandler';
    const katanaBladeId = 'KatanaBlade';

    interface KatanaBlade { }

    @injectable()
    class KatanaBlade implements KatanaBlade { }

    interface KatanaHandler { }

    @injectable()
    class KatanaHandler implements KatanaHandler { }

    interface Sword {
      handler: KatanaHandler;
      blade: KatanaBlade;
    }

    type SwordFactory = () => Sword;

    @injectable()
    class Katana implements Sword {
      public handler: KatanaHandler;
      public blade: KatanaBlade;
      public constructor(
        @inject(katanaHandlerId) @targetName('handler') handler: KatanaHandler,
        @inject(katanaBladeId) @targetName('blade') blade: KatanaBlade
      ) {
        this.handler = handler;
        this.blade = blade;
      }
    }

    interface Shuriken { }

    @injectable()
    class Shuriken implements Shuriken { }

    interface Warrior {
      katana: Katana;
      shuriken: Shuriken;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Katana;
      public shuriken: Shuriken;
      public constructor(
        @inject(katanaFactoryId) @targetName('makeKatana') makeKatana: SwordFactory,
        @inject(shurikenId) @targetName('shuriken') shuriken: Shuriken
      ) {
        this.katana = makeKatana(); // IMPORTANT!
        this.shuriken = shuriken;
      }
    }

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Shuriken>(shurikenId).to(Shuriken);
    container.bind<Katana>(katanaId).to(Katana);
    container.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
    container.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler);
    container.bind<interfaces.Factory<Katana>>(katanaFactoryId).toAutoFactory<Katana>(katanaId);

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);
    const ninja = resolveTyped<Ninja>(context);

    expect(ninja instanceof Ninja).eql(true);
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
    expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it('Should be able to resolve BindingType.Provider bindings', (done) => {

    type SwordProvider = () => Promise<Sword>;

    const ninjaId = 'Ninja';
    const shurikenId = 'Shuriken';
    const swordProviderId = 'Provider<Sword>';
    const swordId = 'Sword';
    const handlerId = 'Handler';
    const bladeId = 'Blade';

    interface Blade { }

    @injectable()
    class KatanaBlade implements Blade { }

    interface Handler { }

    @injectable()
    class KatanaHandler implements Handler { }

    interface Sword {
      handler: Handler;
      blade: Blade;
    }

    @injectable()
    class Katana implements Sword {
      public handler: Handler;
      public blade: Blade;
      public constructor(
        @inject(handlerId) @targetName('handler') handler: Handler,
        @inject(bladeId) @targetName('handler') blade: Blade
      ) {
        this.handler = handler;
        this.blade = blade;
      }
    }

    interface Shuriken { }

    @injectable()
    class Shuriken implements Shuriken { }

    interface Warrior {
      katana: Katana | null;
      katanaProvider: SwordProvider;
      shuriken: Shuriken;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Katana | null;
      public katanaProvider: SwordProvider;
      public shuriken: Shuriken;
      public constructor(
        @inject(swordProviderId) @targetName('katanaProvider') katanaProvider: SwordProvider,
        @inject(shurikenId) @targetName('shuriken') shuriken: Shuriken
      ) {
        this.katana = null;
        this.katanaProvider = katanaProvider;
        this.shuriken = shuriken;
      }
    }

    const container = new Container();
    container.bind<Warrior>(ninjaId).to(Ninja);
    container.bind<Shuriken>(shurikenId).to(Shuriken);
    container.bind<Sword>(swordId).to(Katana);
    container.bind<Blade>(bladeId).to(KatanaBlade);
    container.bind<Handler>(handlerId).to(KatanaHandler);

    container.bind<SwordProvider>(swordProviderId).toProvider<Sword>((theContext: interfaces.Context) =>
      () =>
        new Promise<Sword>((resolveFunc) => {
          // Using setTimeout to simulate complex initialization
          setTimeout(() => { resolveFunc(theContext.container.get<Sword>(swordId)); }, 100);
        }));

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const ninja = resolveTyped<Warrior>(context);

    expect(ninja instanceof Ninja).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);
    ninja.katanaProvider().then((katana) => {
      ninja.katana = katana;
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      done();
    });

  });

  it('Should be able to resolve plans with constraints on tagged targets', () => {

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
        @inject('Weapon') @targetName('katana') @tagged('canThrow', false) katana: Weapon,
        @inject('Weapon') @targetName('shuriken') @tagged('canThrow', true) shuriken: Weapon
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const ninjaId = 'Ninja';
    const weaponId = 'Weapon';

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Weapon>(weaponId).to(Katana).whenTargetTagged('canThrow', false);
    container.bind<Weapon>(weaponId).to(Shuriken).whenTargetTagged('canThrow', true);

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const ninja = resolveTyped<Ninja>(context);

    expect(ninja instanceof Ninja).eql(true);
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it('Should be able to resolve plans with constraints on named targets', () => {

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
        @inject('Weapon') @targetName('katana') @named('strong') katana: Weapon,
        @inject('Weapon') @targetName('shuriken') @named('weak') shuriken: Weapon
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const ninjaId = 'Ninja';
    const weaponId = 'Weapon';

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Weapon>(weaponId).to(Katana).whenTargetNamed('strong');
    container.bind<Weapon>(weaponId).to(Shuriken).whenTargetNamed('weak');

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const ninja = resolveTyped<Ninja>(context);

    expect(ninja instanceof Ninja).eql(true);
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it('Should be able to resolve plans with custom contextual constraints', () => {

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

    const ninjaId = 'Ninja';
    const weaponId = 'Weapon';

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);

    container.bind<Weapon>(weaponId).to(Katana).when((request: interfaces.Request) =>
      request.target.name.equals('katana'));

    container.bind<Weapon>(weaponId).to(Shuriken).when((request: interfaces.Request) =>
      request.target.name.equals('shuriken'));

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const ninja = resolveTyped<Ninja>(context);

    expect(ninja instanceof Ninja).eql(true);
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);
  });

  it('Should be able to resolve plans with multi-injections', () => {

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
      public constructor(
        @multiInject('Weapon') @targetName('weapons') weapons: Weapon[]
      ) {
        this.katana = weapons[0] as Weapon;
        this.shuriken = weapons[1] as Weapon;
      }
    }

    const ninjaId = 'Ninja';
    const weaponId = 'Weapon';

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Weapon>(weaponId).to(Katana);
    container.bind<Weapon>(weaponId).to(Shuriken);

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const ninja = resolveTyped<Ninja>(context);

    expect(ninja instanceof Ninja).eql(true);
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);

    // if only one value is bound to weaponId
    const container2 = new Container();
    container2.bind<Ninja>(ninjaId).to(Ninja);
    container2.bind<Weapon>(weaponId).to(Katana);

    const context2 = plan(new MetadataReader(), container2, false, TargetTypeEnum.Variable, ninjaId);

    const ninja2 = resolveTyped<Ninja>(context2);

    expect(ninja2 instanceof Ninja).eql(true);
    expect(ninja2.katana instanceof Katana).eql(true);

  });

  it('Should be able to resolve plans with async multi-injections', async () => {

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
      public constructor(
        @multiInject('Weapon') weapons: Weapon[]
      ) {
        this.katana = weapons[0] as Weapon;
        this.shuriken = weapons[1] as Weapon;
      }
    }

    const ninjaId = 'Ninja';
    const weaponId = 'Weapon';

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Weapon>(weaponId).toDynamicValue(_ => Promise.resolve(new Katana()));
    container.bind<Weapon>(weaponId).to(Shuriken);

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const ninja = await resolveTyped<Promise<Ninja>>(context);

    expect(ninja instanceof Ninja).eql(true);
    expect(ninja.katana instanceof Katana).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);

    // if only one value is bound to weaponId
    const container2 = new Container();
    container2.bind<Ninja>(ninjaId).to(Ninja);
    container2.bind<Weapon>(weaponId).toDynamicValue(_ => new Katana());

    const context2 = plan(new MetadataReader(), container2, false, TargetTypeEnum.Variable, ninjaId);

    const ninja2 = await resolveTyped<Promise<Ninja>>(context2);

    expect(ninja2 instanceof Ninja).eql(true);
    expect(ninja2.katana instanceof Katana).eql(true);
    expect(ninja2.shuriken === undefined).eql(true)

  });

  it('Should be able to resolve plans with async and non async injections', async () => {
    const syncPropertyId = 'syncProperty'
    const asyncPropertyId = 'asyncProperty'
    const syncCtorId = 'syncCtor'
    const asyncCtorId = 'asyncCtor'
    @injectable()
    class CrazyInjectable {
      public constructor(
        @inject(syncCtorId) readonly syncCtor: string,
        @inject(asyncCtorId) readonly asyncCtor: string) { }
      @inject(syncPropertyId)
      public syncProperty!: string
      @inject(asyncPropertyId)
      public asyncProperty!: string
    }
    const crazyInjectableId = 'crazy'
    const container = new Container();
    container.bind<CrazyInjectable>(crazyInjectableId).to(CrazyInjectable);
    container.bind<string>(syncCtorId).toConstantValue('syncCtor')
    container.bind<string>(asyncCtorId).toDynamicValue(_ => Promise.resolve('asyncCtor'))
    container.bind<string>(syncPropertyId).toConstantValue('syncProperty')
    container.bind<string>(asyncPropertyId).toDynamicValue(_ => Promise.resolve('asyncProperty'))
    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, crazyInjectableId);
    const crazyInjectable = await resolveTyped<Promise<CrazyInjectable>>(context);
    expect(crazyInjectable.syncCtor).eql('syncCtor')
    expect(crazyInjectable.asyncCtor).eql('asyncCtor')
    expect(crazyInjectable.syncProperty).eql('syncProperty')
    expect(crazyInjectable.asyncProperty).eql('asyncProperty')

  });

  it('Should be able to resolve plans with activation handlers', () => {

    interface Sword {
      use(): void;
    }

    @injectable()
    class Katana implements Sword {
      public use() {
        return 'Used Katana!';
      }
    }

    interface Warrior {
      katana: Katana;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Katana;
      public constructor(
        @inject('Katana') katana: Katana
      ) {
        this.katana = katana;
      }
    }

    const ninjaId = 'Ninja';
    const katanaId = 'Katana';

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);

    // This is a global for unit testing but remember
    // that it is not a good idea to use globals
    const timeTracker: string[] = [];

    container.bind<Katana>(katanaId).to(Katana).onActivation((theContext: interfaces.Context, katana: Katana) => {
      const handler = {
        apply(target: any, thisArgument: any, argumentsList: any[]) {
          timeTracker.push(`Starting ${target.name} ${new Date().getTime()}`);
          const result = target.apply(thisArgument, argumentsList);
          timeTracker.push(`Finished ${target.name} ${new Date().getTime()}`);
          return result;
        }
      };
      /// create a proxy for method use() own by katana instance about to be injected
      katana.use = new Proxy(katana.use, handler);
      return katana;
    });

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const ninja = resolveTyped<Ninja>(context);

    expect(ninja.katana.use()).eql('Used Katana!');
    expect(Array.isArray(timeTracker)).eql(true);
    expect(timeTracker.length).eql(2);

  });

  it('Should be able to resolve BindingType.Function bindings', () => {

    const ninjaId = 'Ninja';
    const shurikenId = 'Shuriken';
    const katanaFactoryId = 'KatanaFactory';

    type KatanaFactory = () => Katana;

    interface KatanaBlade { }

    @injectable()
    class KatanaBlade implements KatanaBlade { }

    interface KatanaHandler { }

    @injectable()
    class KatanaHandler implements KatanaHandler { }

    interface Sword {
      handler: KatanaHandler;
      blade: KatanaBlade;
    }

    @injectable()
    class Katana implements Sword {
      public handler: KatanaHandler;
      public blade: KatanaBlade;
      public constructor(handler: KatanaHandler, blade: KatanaBlade) {
        this.handler = handler;
        this.blade = blade;
      }
    }

    interface Shuriken { }

    @injectable()
    class Shuriken implements Shuriken { }

    interface Warrior {
      katanaFactory: KatanaFactory;
      shuriken: Shuriken;
    }

    @injectable()
    class Ninja implements Warrior {
      public constructor(
        @inject(katanaFactoryId) @targetName('katana') public katanaFactory: KatanaFactory,
        @inject(shurikenId) @targetName('shuriken') public shuriken: Shuriken
      ) {
      }
    }

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Shuriken>(shurikenId).to(Shuriken);

    const katanaFactoryInstance = function () {
      return new Katana(new KatanaHandler(), new KatanaBlade());
    };

    container.bind<KatanaFactory>(katanaFactoryId).toFunction(katanaFactoryInstance);

    const katanaFactoryBinding = getBindingDictionary(container).get(katanaFactoryId)[0];
    expect(katanaFactoryBinding?.activated).eql(false);

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const ninja = resolveTyped<Ninja>(context);

    expect(ninja instanceof Ninja).eql(true);
    expect(typeof ninja.katanaFactory === 'function').eql(true);
    expect(ninja.katanaFactory() instanceof Katana).eql(true);
    expect(ninja.katanaFactory().handler instanceof KatanaHandler).eql(true);
    expect(ninja.katanaFactory().blade instanceof KatanaBlade).eql(true);
    expect(ninja.shuriken instanceof Shuriken).eql(true);
    expect(katanaFactoryBinding?.activated).eql(true);

    expect(katanaFactoryBinding?.activated).eql(true);

  });

  it('Should run the @PostConstruct method', () => {

    interface Sword {
      use(): string;
    }

    @injectable()
    class Katana implements Sword {
      private useMessage!: string;

      public use() {
        return this.useMessage;
      }

      @postConstruct()
      public postConstruct() {
        this.useMessage = 'Used Katana!';
      }
    }

    interface Warrior {
      katana: Katana;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Katana;
      public constructor(@inject('Katana') katana: Katana) {
        this.katana = katana;
      }
    }
    const ninjaId = 'Ninja';
    const katanaId = 'Katana';

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);

    container.bind<Katana>(katanaId).to(Katana);

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const ninja = resolveTyped<Ninja>(context);

    expect(ninja.katana.use()).eql('Used Katana!');

  });

  it('Should throw an error if the @postConstruct method throws an error', () => {

    @injectable()
    class Katana {

      @postConstruct()
      public postConstruct() {
        throw new Error('Original Message');
      }
    }

    expect(() => resolveInstance({} as interfaces.Binding<unknown>, Katana, [], () => null))
      .to.throw('@postConstruct error in class Katana: Original Message');
  });

  it('Should run the @PostConstruct method of parent class', () => {

    interface Weapon {
      use(): string;
    }

    @injectable()
    abstract class Sword implements Weapon {
      protected useMessage!: string;

      @postConstruct()
      public postConstruct() {
        this.useMessage = 'Used Weapon!';
      }

      public abstract use(): string;
    }

    @injectable()
    class Katana extends Sword {
      public use() {
        return this.useMessage;
      }
    }

    interface Warrior {
      katana: Katana;
    }

    @injectable()
    class Ninja implements Warrior {
      public katana: Katana;
      public constructor(@inject('Katana') katana: Katana) {
        this.katana = katana;
      }
    }
    const ninjaId = 'Ninja';
    const katanaId = 'Katana';

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);

    container.bind<Katana>(katanaId).to(Katana);

    const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

    const ninja = resolveTyped<Ninja>(context);

    expect(ninja.katana.use()).eql('Used Weapon!');

  });

  it('Should run the @PostConstruct method once in the singleton scope', () => {
    let timesCalled = 0;
    @injectable()
    class Katana {
      @postConstruct()
      public postConstruct() {
        timesCalled++;
      }
    }

    @injectable()
    class Ninja {
      public katana: Katana;
      public constructor(@inject('Katana') katana: Katana) {
        this.katana = katana;
      }
    }

    @injectable()
    class Samurai {
      public katana: Katana;
      public constructor(@inject('Katana') katana: Katana) {
        this.katana = katana;
      }
    }
    const ninjaId = 'Ninja';
    const samuraiId = 'Samurai';
    const katanaId = 'Katana';

    const container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Samurai>(samuraiId).to(Samurai);
    container.bind<Katana>(katanaId).to(Katana).inSingletonScope();
    container.get(ninjaId);
    container.get(samuraiId);
    expect(timesCalled).to.be.equal(1);

  });

  it('Should not cache bindings if a dependency in the async chain fails', async () => {
    let level2Attempts = 0;

    @injectable()
    class Level2 {
      public value: string;

      public constructor(@inject('level1') value: string) {
        level2Attempts += 1;
        this.value = value;
      }
    }

    let level1Attempts = 0;

    const container = new Container({ defaultScope: 'Singleton', autoBindInjectable: true });
    container.bind('level1').toDynamicValue(async (context) => {
      level1Attempts += 1;

      if (level1Attempts === 1) {
        throw new Error('first try failed.');
      }

      return 'foobar';
    });
    container.bind('a').to(Level2);

    try {
      await container.getAsync('a');

      throw new Error('should have failed on first invocation.');
    } catch (ex) {
      // ignore
    }

    const level2 = await container.getAsync<Level2>('a');
    expect(level2.value).equals('foobar');

    expect(level1Attempts).equals(2);
    expect(level2Attempts).equals(1);
  });

  it('Should support async when default scope is singleton', async () => {
    const container = new Container({ defaultScope: 'Singleton' });
    container.bind('a').toDynamicValue(async () => Math.random());

    const object1 = await container.getAsync('a');
    const object2 = await container.getAsync('a');

    expect(object1).equals(object2);
  });

  it('Should return different values if default singleton scope is overriden by bind', async () => {
    const container = new Container({ defaultScope: 'Singleton' });
    container.bind('a').toDynamicValue(async () => Math.random()).inTransientScope();

    const object1 = await container.getAsync('a');
    const object2 = await container.getAsync('a');

    expect(object1).not.equals(object2);
  });

  it('Should only call parent async singleton once within child containers', async () => {
    const parent = new Container();
    parent.bind<Date>('Parent').toDynamicValue(() => Promise.resolve(new Date())).inSingletonScope();
    const child = parent.createChild();
    const [subject1, subject2] = await Promise.all([
      child.getAsync<Date>('Parent'),
      child.getAsync<Date>('Parent')
    ]);

    expect(subject1 === subject2).eql(true);
  });

  it('should not deactivate a non activated constant value', () => {
    const container = new Container();
    container.bind<string>('ConstantValue').toConstantValue('Constant').onDeactivation(sinon.mock().never());
    container.unbind('ConstantValue');
  });


  it('Should return resolved instance to onDeactivation when binding is async', async () => {
    @injectable()
    class Destroyable {
    }

    const container = new Container();
    let deactivatedDestroyable: Destroyable | null = null
    container.bind<Destroyable>('Destroyable').toDynamicValue(() => Promise.resolve(new Destroyable())).inSingletonScope()
      .onDeactivation((instance) => new Promise((r) => {
        deactivatedDestroyable = instance
        r();
      }));

    await container.getAsync('Destroyable');

    await container.unbindAsync('Destroyable');

    expect(deactivatedDestroyable).instanceof(Destroyable);

    // with BindingInWhenOnSyntax
    const container2 = new Container({ defaultScope: 'Singleton' });
    let deactivatedDestroyable2: Destroyable | null = null
    container2.bind<Destroyable>('Destroyable').toDynamicValue(() => Promise.resolve(new Destroyable()))
      .onDeactivation((instance) => new Promise((r) => {
        deactivatedDestroyable2 = instance
        r();
      }));

    await container2.getAsync('Destroyable');

    await container2.unbindAsync('Destroyable');

    expect(deactivatedDestroyable2).instanceof(Destroyable);
  });

  it('Should wait on deactivation promise before returning unbindAsync()', async () => {
    let resolved = false;

    @injectable()
    class Destroyable {
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope()
      .onDeactivation(() => new Promise((r) => {
        r();

        resolved = true;
      }));

    container.get('Destroyable');

    await container.unbindAsync('Destroyable');

    expect(resolved).eql(true);
  });

  it('Should wait on predestroy promise before returning unbindAsync()', async () => {
    let resolved = false;

    @injectable()
    class Destroyable {
      @preDestroy()
      public myPreDestroyMethod() {
        return new Promise((r) => {
          r({});

          resolved = true;
        });
      }
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope();

    container.get('Destroyable');

    await container.unbindAsync('Destroyable');

    expect(resolved).eql(true);
  });

  it('Should wait on deactivation promise before returning unbindAllAsync()', async () => {
    let resolved = false;

    @injectable()
    class Destroyable {
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope()
      .onDeactivation(() => new Promise((r) => {
        r();

        resolved = true;
      }));

    container.get('Destroyable');

    await container.unbindAllAsync();

    expect(resolved).eql(true);
  });

  it('Should wait on predestroy promise before returning unbindAllAsync()', async () => {
    let resolved = false;

    @injectable()
    class Destroyable {
      @preDestroy()
      public myPreDestroyMethod() {
        return new Promise((r) => {
          r({});

          resolved = true;
        });
      }
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope();

    container.get('Destroyable');

    await container.unbindAllAsync();

    expect(resolved).eql(true);
  });

  it('Should call bind.cache.then on unbind w/ PromiseLike binding', async () => {

    const bindStub = sinon.stub().callsFake(() => {
      return {
        serviceIdentifier: 'PromiseLike'
      };
    });

    const stub = sinon.stub().callsFake((bindResolve) => {
      bindResolve(bindStub());
    });

    @injectable()
    class PromiseLike {
      public then() {
        return {
          then: stub
        };
      }
    }

    const container = new Container();

    container.bind('PromiseLike').toConstantValue(new PromiseLike());

    container.getAsync('PromiseLike');

    container.unbindAll();

    sinon.assert.calledOnce(stub);
    sinon.assert.calledOnce(bindStub);
  });

  it('Should not allow transient construction with async preDestroy', async () => {
    @injectable()
    class Destroyable {
      @preDestroy()
      public myPreDestroyMethod() {
        return Promise.resolve();
      }
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inTransientScope();

    expect(() => container.get('Destroyable')).to
      .throw('@preDestroy error in class Destroyable: Class cannot be instantiated in transient scope.');
  });

  it('Should not allow transient construction with async deactivation', async () => {
    @injectable()
    class Destroyable {
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inTransientScope()
      .onDeactivation(() => Promise.resolve());

    expect(() => container.get('Destroyable')).to
      .throw('onDeactivation() error in class Destroyable: Class cannot be instantiated in transient scope.');
  });

  it('Should not allow request construction with preDestroy', async () => {
    @injectable()
    class Destroyable {
      @preDestroy()
      public myPreDestroyMethod() {
        return;
      }
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inRequestScope();

    expect(() => container.get('Destroyable')).to
      .throw('@preDestroy error in class Destroyable: Class cannot be instantiated in request scope.');
  });

  it('Should not allow request construction with deactivation', async () => {
    @injectable()
    class Destroyable {
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inRequestScope()
      .onDeactivation(() => {
        //
      });

    expect(() => container.get('Destroyable')).to
      .throw('onDeactivation() error in class Destroyable: Class cannot be instantiated in request scope.');
  });

  it('Should force a class with an async deactivation to use the async unbindAll api', async () => {
    @injectable()
    class Destroyable {
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope()
      .onDeactivation(() => Promise.resolve());

    container.get('Destroyable');

    expect(() => container.unbindAll()).to
      .throw('Attempting to unbind dependency with asynchronous destruction (@preDestroy or onDeactivation)');
  });

  it('Should force a class with an async pre destroy to use the async unbindAll api', async () => {
    @injectable()
    class Destroyable {
      @preDestroy()
      public myPreDestroyMethod() {
        return Promise.resolve();
      }
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope();

    container.get('Destroyable');

    expect(() => container.unbindAll()).to
      .throw('Attempting to unbind dependency with asynchronous destruction (@preDestroy or onDeactivation)');
  });

  it('Should force a class with an async deactivation to use the async unbind api', async () => {
    @injectable()
    class Destroyable {
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope()
      .onDeactivation(() => Promise.resolve());

    container.get('Destroyable');

    expect(() => container.unbind('Destroyable')).to
      .throw('Attempting to unbind dependency with asynchronous destruction (@preDestroy or onDeactivation)');
  });

  it('Should throw deactivation error when errors in deactivation ( sync )', () => {
    @injectable()
    class Destroyable {
    }
    const errorMessage = 'the error message'
    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope()
      .onDeactivation(() => { throw new Error(errorMessage) });

    container.get('Destroyable');

    const expectedErrorMessage = ERROR_MSGS.ON_DEACTIVATION_ERROR('Destroyable', errorMessage)

    expect(() => container.unbind('Destroyable')).to
      .throw(expectedErrorMessage);
  })

  it('Should throw deactivation error when errors in deactivation ( async )', async () => {
    @injectable()
    class Destroyable {
    }
    const errorMessage = 'the error message'
    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope()
      .onDeactivation(() => Promise.reject(new Error(errorMessage)));

    container.get('Destroyable');

    const expectedErrorMessage = ERROR_MSGS.ON_DEACTIVATION_ERROR('Destroyable', errorMessage)

    let error: Error | unknown;
    try {
      await container.unbindAsync('Destroyable')
    } catch (e) {
      error = e
    }
    expect((error as Error).message).to.eql(expectedErrorMessage)
  })

  it('Should invoke destroy in order (all async): child container, parent container, binding, class', async () => {
    let roll = 1;
    let binding = null;
    let klass = null;
    let parent = null;
    let child = null;

    @injectable()
    class Destroyable {
      @preDestroy()
      public myPreDestroyMethod() {
        return new Promise((presolve) => {
          klass = roll;
          roll += 1;
          presolve({});
        });
      }
    }

    const container = new Container();
    container.onDeactivation('Destroyable', () => {
      return new Promise((presolve) => {
        parent = roll;
        roll += 1;
        presolve();
      });
    });

    const childContainer = container.createChild();
    childContainer.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope().onDeactivation(() => new Promise((presolve) => {
      binding = roll;
      roll += 1;
      presolve();
    }));
    childContainer.onDeactivation('Destroyable', () => {
      return new Promise((presolve) => {
        child = roll;
        roll += 1;
        presolve();
      });
    });

    childContainer.get('Destroyable');
    await childContainer.unbindAsync('Destroyable');

    expect(roll).eql(5);
    expect(child).eql(1);
    expect(parent).eql(2);
    expect(binding).eql(3);
    expect(klass).eql(4);
  });

  it('Should invoke destroy in order (sync + async): child container, parent container, binding, class', async () => {
    let roll = 1;
    let binding = null;
    let klass = null;
    let parent = null;
    let child = null;

    @injectable()
    class Destroyable {
      @preDestroy()
      public myPreDestroyMethod() {
        return new Promise((presolve) => {
          klass = roll;
          roll += 1;
          presolve({});
        });
      }
    }

    const container = new Container();
    container.onDeactivation('Destroyable', () => {
      parent = roll;
      roll += 1;
    });

    const childContainer = container.createChild();
    childContainer.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope().onDeactivation(() => {
      binding = roll;
      roll += 1;
    });
    childContainer.onDeactivation('Destroyable', () => {
      return new Promise((presolve) => {
        child = roll;
        roll += 1;
        presolve();
      });
    });

    childContainer.get('Destroyable');
    await childContainer.unbindAsync('Destroyable');

    expect(roll).eql(5);
    expect(child).eql(1);
    expect(parent).eql(2);
    expect(binding).eql(3);
    expect(klass).eql(4);
  });

  it('Should invoke destroy in order (all sync): child container, parent container, binding, class', () => {
    let roll = 1;
    let binding = null;
    let klass = null;
    let parent = null;
    let child = null;

    @injectable()
    class Destroyable {
      @preDestroy()
      public myPreDestroyMethod() {
        klass = roll;
        roll += 1;
      }
    }

    const container = new Container();
    container.onDeactivation('Destroyable', () => {
      parent = roll;
      roll += 1;
    });

    const childContainer = container.createChild();
    childContainer.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope().onDeactivation(() => {
      binding = roll;
      roll += 1;
    });
    childContainer.onDeactivation('Destroyable', () => {
      child = roll;
      roll += 1;
    });

    childContainer.get('Destroyable');
    childContainer.unbind('Destroyable');

    expect(roll).eql(5);
    expect(child).eql(1);
    expect(parent).eql(2);
    expect(binding).eql(3);
    expect(klass).eql(4);
  });

  it('Should invoke destroy in order (async): child container, parent container, binding, class', async () => {
    let roll = 1;
    let binding = null;
    let klass = null;
    let parent = null;
    let child = null;

    @injectable()
    class Destroyable {
      @preDestroy()
      public async myPreDestroyMethod() {
        klass = roll;
        roll += 1;
      }
    }

    const container = new Container();
    container.onDeactivation('Destroyable', async () => {
      parent = roll;
      roll += 1;
    });

    const childContainer = container.createChild();
    childContainer.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope().onDeactivation(() => {
      binding = roll;
      roll += 1;
    });
    childContainer.onDeactivation('Destroyable', () => {
      child = roll;
      roll += 1;
    });

    childContainer.get('Destroyable');
    await childContainer.unbindAsync('Destroyable');

    expect(roll).eql(5);
    expect(child).eql(1);
    expect(parent).eql(2);
    expect(binding).eql(3);
    expect(klass).eql(4);
  });

  it('Should force a class with an async pre destroy to use the async unbind api', async () => {
    @injectable()
    class Destroyable {
      @preDestroy()
      public myPreDestroyMethod() {
        return Promise.resolve();
      }
    }

    const container = new Container();
    container.bind<Destroyable>('Destroyable').to(Destroyable).inSingletonScope();

    container.get('Destroyable');

    expect(() => container.unbind('Destroyable')).to
      .throw('Attempting to unbind dependency with asynchronous destruction (@preDestroy or onDeactivation)');
  });

  it('Should force a class with an async onActivation to use the async api', async () => {
    @injectable()
    class Constructable {
    }

    const container = new Container();
    container.bind<Constructable>('Constructable').to(Constructable).inSingletonScope()
      .onActivation(() => Promise.resolve());

    expect(() => container.get('Constructable')).to.throw(`You are attempting to construct 'Constructable' in a synchronous way
 but it has asynchronous dependencies.`);
  });

  it('Should force a class with an async post construct to use the async api', async () => {
    @injectable()
    class Constructable {
      @postConstruct()
      public myPostConstructMethod() {
        return Promise.resolve();
      }
    }

    const container = new Container();
    container.bind<Constructable>('Constructable').to(Constructable);

    expect(() => container.get('Constructable')).to.throw(`You are attempting to construct 'Constructable' in a synchronous way
 but it has asynchronous dependencies.`);
  });

  it('Should retry promise if first time failed', async () => {
    @injectable()
    class Constructable {
    }

    let attemped = false;

    const container = new Container();
    container.bind<Constructable>('Constructable').toDynamicValue(() => {
      if (attemped) {
        return Promise.resolve(new Constructable());
      }

      attemped = true;

      return Promise.reject('break');
    }).inSingletonScope();

    try {
      await container.getAsync('Constructable');

      throw new Error('should have thrown exception.');
    } catch (ex) {
      await container.getAsync('Constructable');
    }
  });

  it('Should return resolved instance to onActivation when binding is async', async () => {
    @injectable()
    class Constructable {
    }
    let activated: Constructable | null = null
    const container = new Container();
    container.bind<Constructable>('Constructable').toDynamicValue(() => Promise.resolve(new Constructable())).inSingletonScope()
      .onActivation((context, c) => new Promise((r) => {
        activated = c
        r(c);
      }));

    await container.getAsync('Constructable');
    expect(activated).instanceof(Constructable);
  });

  it('Should not allow sync get if an async activation was added to container', async () => {
    const container = new Container();
    container.bind('foo').toConstantValue('bar');

    container.onActivation('foo', () => Promise.resolve('baz'));

    expect(() => container.get('foo')).to.throw(`You are attempting to construct 'foo' in a synchronous way
 but it has asynchronous dependencies.`);
  });

  it('Should allow onActivation (sync) of a previously binded sync object (without activation)', async () => {
    const container = new Container();
    container.bind('foo').toConstantValue('bar');

    container.onActivation('foo', () => 'baz');

    const result = container.get('foo');

    expect(result).eql('baz');
  });

  it('Should allow onActivation to replace objects in async autoBindInjectable chain', async () => {
    class Level1 {

    }

    @injectable()
    class Level2 {
      public level1: Level1;

      constructor(@inject(Level1) l1: Level1) {
        this.level1 = l1;
      }
    }

    @injectable()
    class Level3 {
      public level2: Level2;

      constructor(@inject(Level2) l2: Level2) {
        this.level2 = l2;
      }
    }

    const constructedLevel2 = new Level2(new Level1());

    const container = new Container({ autoBindInjectable: true, defaultScope: 'Singleton' });
    container.bind(Level1).toDynamicValue(() => Promise.resolve(new Level1()));
    container.onActivation(Level2, () => {
      return Promise.resolve(constructedLevel2);
    });

    const level2 = await container.getAsync(Level2);

    expect(level2).equals(constructedLevel2);

    const level3 = await container.getAsync(Level3);

    expect(level3.level2).equals(constructedLevel2);
  });

  it('Should allow onActivation (async) of a previously binded sync object (without activation)', async () => {
    const container = new Container();
    container.bind('foo').toConstantValue('bar');

    container.onActivation('foo', () => Promise.resolve('baz'));

    const result = await container.getAsync('foo');

    expect(result).eql('baz');
  });

  it('Should allow onActivation (sync) of a previously binded async object (without activation)', async () => {
    const container = new Container();
    container.bind('foo').toDynamicValue(() => Promise.resolve('bar'));

    container.onActivation('foo', () => 'baz');

    const result = await container.getAsync('foo');

    expect(result).eql('baz');
  });

  it('Should allow onActivation (async) of a previously binded async object (without activation)', async () => {
    const container = new Container();
    container.bind('foo').toDynamicValue(() => Promise.resolve('bar'));

    container.onActivation('foo', () => Promise.resolve('baz'));

    const result = await container.getAsync('foo');

    expect(result).eql('baz');
  });

  it('Should allow onActivation (sync) of a previously binded sync object (with activation)', async () => {
    const container = new Container();
    container.bind('foo').toConstantValue('bar').onActivation(() => 'bum');

    container.onActivation('foo', (context, previous) => `${previous}baz`);

    const result = container.get('foo');

    expect(result).eql('bumbaz');
  });

  it('Should allow onActivation (async) of a previously binded sync object (with activation)', async () => {
    const container = new Container();
    container.bind('foo').toConstantValue('bar').onActivation(() => 'bum');

    container.onActivation('foo', (context, previous) => Promise.resolve(`${previous}baz`));

    const result = await container.getAsync('foo');

    expect(result).eql('bumbaz');
  });

  it('Should allow onActivation (sync) of a previously binded async object (with activation)', async () => {
    const container = new Container();
    container.bind('foo').toDynamicValue(() => Promise.resolve('bar')).onActivation(() => 'bum');

    container.onActivation('foo', (context, previous) => `${previous}baz`);

    const result = await container.getAsync('foo');

    expect(result).eql('bumbaz');
  });

  it('Should allow onActivation (async) of a previously binded async object (with activation)', async () => {
    const container = new Container();
    container.bind('foo').toDynamicValue(() => Promise.resolve('bar')).onActivation(() => 'bum');

    container.onActivation('foo', (context, previous) => Promise.resolve(`${previous}baz`));

    const result = await container.getAsync('foo');

    expect(result).eql('bumbaz');
  });

  it('Should allow onActivation (sync) of parent (async) through autobind tree', async () => {
    class Parent {
    }

    @injectable()
    class Child {
      public parent: Parent;

      public constructor(@inject(Parent) parent: Parent) {
        this.parent = parent;
      }
    }

    const container = new Container({ autoBindInjectable: true });
    container.bind<Parent>(Parent).toDynamicValue(() => Promise.resolve(new Parent()));

    const constructed = new Parent();
    // @ts-ignore
    constructed.foo = 'bar';

    container.onActivation(Parent, () => constructed);

    const result = await container.getAsync(Child);

    expect(result.parent).equals(constructed);
  });

  it('Should allow onActivation (sync) of child (async) through autobind tree', async () => {
    class Parent {

    }

    @injectable()
    class Child {
      public parent: Parent;

      public constructor(@inject(Parent) parent: Parent) {
        this.parent = parent;
      }
    }

    const container = new Container({ autoBindInjectable: true });
    container.bind<Parent>(Parent).toDynamicValue(() => Promise.resolve(new Parent()));

    const constructed = new Child(new Parent());

    container.onActivation(Child, () => constructed);

    const result = await container.getAsync(Child);

    expect(result).equals(constructed);
  });

  it('Should allow onActivation (async) of parent (async) through autobind tree', async () => {
    class Parent {
    }

    @injectable()
    class Child {
      public parent: Parent;

      public constructor(@inject(Parent) parent: Parent) {
        this.parent = parent;
      }
    }

    const container = new Container({ autoBindInjectable: true });
    container.bind<Parent>(Parent).toDynamicValue(() => Promise.resolve(new Parent()));

    const constructed = new Parent();

    container.onActivation(Parent, () => Promise.resolve(constructed));

    const result = await container.getAsync(Child);

    expect(result.parent).equals(constructed);
  });

  it('Should allow onActivation (async) of child (async) through autobind tree', async () => {
    class Parent {

    }

    @injectable()
    class Child {
      public parent: Parent;

      public constructor(@inject(Parent) parent: Parent) {
        this.parent = parent;
      }
    }

    const container = new Container({ autoBindInjectable: true });
    container.bind<Parent>(Parent).toDynamicValue(() => Promise.resolve(new Parent()));

    const constructed = new Child(new Parent());

    container.onActivation(Child, () => Promise.resolve(constructed));

    const result = await container.getAsync(Child);

    expect(result).equals(constructed);
  });

  it('Should allow onActivation of child on parent container', async () => {
    class Parent {

    }

    @injectable()
    class Child {
      public parent: Parent;

      public constructor(@inject(Parent) parent: Parent) {
        this.parent = parent;
      }
    }

    const container = new Container({ autoBindInjectable: true });
    container.bind<Parent>(Parent).toDynamicValue(() => Promise.resolve(new Parent()));

    const constructed = new Child(new Parent());

    container.onActivation(Child, () => Promise.resolve(constructed));

    const child = container.createChild();

    const result = await child.getAsync(Child);

    expect(result).equals(constructed);
  });

  it('Should allow onActivation of parent on parent container', async () => {
    class Parent {

    }

    @injectable()
    class Child {
      public parent: Parent;

      public constructor(@inject(Parent) parent: Parent) {
        this.parent = parent;
      }
    }

    const container = new Container({ autoBindInjectable: true });
    container.bind<Parent>(Parent).toDynamicValue(() => Promise.resolve(new Parent()));

    const constructed = new Parent();

    container.onActivation(Parent, () => Promise.resolve(constructed));

    const child = container.createChild();

    const result = await child.getAsync(Child);

    expect(result.parent).equals(constructed);
  });

  it('Should allow onActivation of child from child container', async () => {
    class Parent {

    }

    @injectable()
    class Child {
      public parent: Parent;

      public constructor(@inject(Parent) parent: Parent) {
        this.parent = parent;
      }
    }

    const container = new Container({ autoBindInjectable: true });
    container.bind<Parent>(Parent).toDynamicValue(() => Promise.resolve(new Parent()));

    const constructed = new Child(new Parent());

    const child = container.createChild();
    child.onActivation(Child, () => Promise.resolve(constructed));

    const result = await child.getAsync(Child);

    expect(result).equals(constructed);
  });

  it('Should priortize onActivation of parent container over child container', () => {
    const container = new Container();
    container.onActivation('foo', (context, previous) => `${previous}baz`);
    container.onActivation('foo', (context, previous) => `${previous}1`);

    const child = container.createChild();

    child.bind<string>('foo').toConstantValue('bar').onActivation((c, previous) => `${previous}bah`);
    child.onActivation('foo', (context, previous) => `${previous}bum`);
    child.onActivation('foo', (context, previous) => `${previous}2`);

    const result = child.get('foo');

    expect(result).equals('barbahbaz1bum2');
  });

  it('Should priortize async onActivation of parent container over child container (async)', async () => {
    const container = new Container();
    container.onActivation('foo', async (context, previous) => `${previous}baz`);
    container.onActivation('foo', async (context, previous) => `${previous}1`);

    const child = container.createChild();

    child.bind<string>('foo').toConstantValue('bar').onActivation((c, previous) => `${previous}bah`);
    child.onActivation('foo', async (context, previous) => `${previous}bum`);
    child.onActivation('foo', async (context, previous) => `${previous}2`);

    const result = await child.getAsync('foo');

    expect(result).equals('barbahbaz1bum2');
  });

  it('Should not allow onActivation of parent on child container', async () => {
    class Parent {

    }

    @injectable()
    class Child {
      public parent: Parent;

      public constructor(@inject(Parent) parent: Parent) {
        this.parent = parent;
      }
    }

    const container = new Container({ autoBindInjectable: true });
    container.bind<Parent>(Parent).toDynamicValue(() => Promise.resolve(new Parent())).inSingletonScope();

    const constructed = new Parent();

    const child = container.createChild();
    child.onActivation(Parent, () => Promise.resolve(constructed));

    const result = await child.getAsync(Child);

    expect(result.parent).not.equals(constructed);
  });

  it('Should wait until onActivation promise resolves before returning object', async () => {
    let resolved = false;

    @injectable()
    class Constructable {
    }

    const container = new Container();
    container.bind<Constructable>('Constructable').to(Constructable).inSingletonScope()
      .onActivation((context, c) => new Promise((r) => {
        resolved = true;
        r(c);
      }));

    const result = await container.getAsync('Constructable');

    expect(result).instanceof(Constructable);
    expect(resolved).eql(true);
  });

  it('Should wait until postConstruct promise resolves before returning object', async () => {
    let resolved = false;

    @injectable()
    class Constructable {
      @postConstruct()
      public myPostConstructMethod() {
        return new Promise((r) => {
          resolved = true;
          r({});
        });
      }
    }

    const container = new Container();
    container.bind<Constructable>('Constructable').to(Constructable);

    const result = await container.getAsync('Constructable');

    expect(result).instanceof(Constructable);
    expect(resolved).eql(true);
  });

  it('Should only call async method once if marked as singleton (indirect)', async () => {
    @injectable()
    class UseDate implements UseDate {
      public currentDate: Date;
      public constructor(@inject('Date') currentDate: Date) {
        expect(currentDate).instanceOf(Date);

        this.currentDate = currentDate;
      }
      public doSomething() {
        return this.currentDate;
      }
    }

    const container = new Container();
    container.bind<UseDate>('UseDate').to(UseDate);
    container.bind<Date>('Date').toDynamicValue(() => Promise.resolve(new Date())).inSingletonScope();

    const subject1 = await container.getAsync<UseDate>('UseDate');
    const subject2 = await container.getAsync<UseDate>('UseDate');
    expect(subject1.doSomething() === subject2.doSomething()).eql(true);
  });

  it('Should support async singletons when using autoBindInjectable', async () => {
    @injectable()
    class AsyncValue {
      public date: Date;
      public constructor(@inject('Date') date: Date) {
        this.date = date;
      }
    }

    @injectable()
    class MixedDependency {
      public asyncValue: AsyncValue;
      public date!: Date;
      public constructor(@inject(AsyncValue) asyncValue: AsyncValue) {
        expect(asyncValue).instanceOf(AsyncValue);

        this.asyncValue = asyncValue;
      }
    }

    const container = new Container({ autoBindInjectable: true, defaultScope: 'Singleton' });
    container.bind<Date>('Date').toDynamicValue(() => Promise.resolve(new Date())).inSingletonScope();

    const object1 = await container.getAsync<MixedDependency>(MixedDependency);
    const object2 = await container.getAsync<MixedDependency>(MixedDependency);

    expect(object1).equals(object2);
  });

  it('Should support shared async singletons when using autoBindInjectable', async () => {
    @injectable()
    class AsyncValue {
      public date: Date;
      public constructor(@inject('Date') date: Date) {
        this.date = date;
      }
    }

    @injectable()
    class MixedDependency {
      public asyncValue: AsyncValue;
      public constructor(@inject(AsyncValue) asyncValue: AsyncValue) {
        expect(asyncValue).instanceOf(AsyncValue);

        this.asyncValue = asyncValue;
      }
    }

    const container = new Container({ autoBindInjectable: true, defaultScope: 'Singleton' });
    container.bind<Date>('Date').toDynamicValue(() => Promise.resolve(new Date())).inSingletonScope();

    const async = await container.getAsync<AsyncValue>(AsyncValue);

    const object1 = await container.getAsync<MixedDependency>(MixedDependency);

    expect(async).equals(object1.asyncValue);
  });

  it('Should support async dependencies in multiple layers', async () => {
    @injectable()
    class AsyncValue {
      public date: Date;
      public constructor(@inject('Date') date: Date) {
        //expect(date).instanceOf(date);

        this.date = date;
      }
    }

    @injectable()
    class MixedDependency {
      public asyncValue: AsyncValue;
      public date: Date;
      public constructor(@inject(AsyncValue) asyncValue: AsyncValue, @inject('Date') date: Date) {
        expect(asyncValue).instanceOf(AsyncValue);
        expect(date).instanceOf(Date);

        this.date = date;
        this.asyncValue = asyncValue;
      }
    }

    const container = new Container({ autoBindInjectable: true });
    container.bind<Date>('Date').toDynamicValue(() => Promise.resolve(new Date())).inSingletonScope();

    const subject1 = await container.getAsync<MixedDependency>(MixedDependency);
    expect(subject1.date).instanceOf(Date);
    expect(subject1.asyncValue).instanceOf(AsyncValue);
  });

  it('Should support async values already in cache', async () => {
    const container = new Container({ autoBindInjectable: true });
    container.bind<Date>('Date').toDynamicValue(() => Promise.resolve(new Date())).inSingletonScope();

    expect(await container.getAsync<Date>('Date')).instanceOf(Date); // causes container to cache singleton as Lazy object
    expect(await container.getAsync<Date>('Date')).instanceOf(Date);
  });

  it('Should support async values already in cache when there dependencies', async () => {
    @injectable()
    class HasDependencies {
      public constructor(@inject('Date') date: Date) {
        expect(date).instanceOf(Date);
      }
    }

    const container = new Container({ autoBindInjectable: true });
    container.bind<Date>('Date').toDynamicValue(() => Promise.resolve(new Date())).inSingletonScope();

    expect(await container.getAsync<Date>('Date')).instanceOf(Date); // causes container to cache singleton as Lazy object
    await container.getAsync<HasDependencies>(HasDependencies);
  });

  it('Should support async values already in cache when there are transient dependencies', async () => {
    @injectable()
    class Parent {
      public constructor(@inject('Date') date: Date) {
        expect(date).instanceOf(Date);
      }
    }

    @injectable()
    class Child {
      public constructor(
        @inject(Parent) parent: Parent,
        @inject('Date') date: Date
      ) {
        expect(parent).instanceOf(Parent);
        expect(date).instanceOf(Date);
      }
    }

    const container = new Container({ autoBindInjectable: true });
    container.bind<Date>('Date').toDynamicValue(() => Promise.resolve(new Date())).inSingletonScope();

    expect(await container.getAsync<Date>('Date')).instanceOf(Date); // causes container to cache singleton as Lazy object
    await container.getAsync<Child>(Child);
  });

  it('Should be able to mix async bindings with non-async values', async () => {
    @injectable()
    class UseDate implements UseDate {
      public currentDate: Date;
      public foobar: string;

      public constructor(@inject('Date') currentDate: Date, @inject('Static') foobar: string) {
        expect(currentDate).instanceOf(Date);

        this.currentDate = currentDate;
        this.foobar = foobar;
      }
    }

    const container = new Container();
    container.bind<UseDate>('UseDate').to(UseDate);
    container.bind<Date>('Date').toDynamicValue(() => Promise.resolve(new Date()));
    container.bind<String>('Static').toConstantValue('foobar');

    const subject1 = await container.getAsync<UseDate>('UseDate');
    expect(subject1.foobar).eql('foobar');
  });

  it('Should throw exception if using sync API with async dependencies', async () => {
    @injectable()
    class UseDate implements UseDate {
      public currentDate: Date;
      public constructor(@inject('Date') currentDate: Date) {
        expect(currentDate).instanceOf(Date);

        this.currentDate = currentDate;
      }
      public doSomething() {
        return this.currentDate;
      }
    }

    const container = new Container();
    container.bind<UseDate>('UseDate').to(UseDate);
    container.bind<Date>('Date').toDynamicValue(() => Promise.resolve(new Date()));

    expect(() => container.get<UseDate>('UseDate')).to.throw(`You are attempting to construct 'UseDate' in a synchronous way
 but it has asynchronous dependencies.`);
  });

  it('Should be able to resolve indirect Promise bindings', async () => {
    @injectable()
    class UseDate implements UseDate {
      public currentDate: Date;
      public constructor(@inject('Date') currentDate: Date) {
        expect(currentDate).instanceOf(Date);

        this.currentDate = currentDate;
      }
      public doSomething() {
        return this.currentDate;
      }
    }

    const container = new Container();
    container.bind<UseDate>('UseDate').to(UseDate);
    container.bind<Date>('Date').toDynamicValue(() => Promise.resolve(new Date()));

    const subject1 = await container.getAsync<UseDate>('UseDate');
    const subject2 = await container.getAsync<UseDate>('UseDate');
    expect(subject1.doSomething() === subject2.doSomething()).eql(false);
  });

  it('Should be able to resolve direct promise bindings', async () => {
    const container = new Container();
    container.bind<string>('async').toDynamicValue(() => Promise.resolve('foobar'));

    const value = await container.getAsync<string>('async');
    expect(value).eql('foobar');
  });

  it('Should error if trying to resolve an promise in sync API', () => {
    const container = new Container();
    container.bind<string>('async').toDynamicValue(() => Promise.resolve('foobar'));

    expect(() => container.get<string>('async')).to.throw(`You are attempting to construct 'async' in a synchronous way
 but it has asynchronous dependencies.`);
  });

  it('Should cache a a resolved value on singleton when possible', async () => {
    const container = new Container();

    const asyncServiceIdentifier = 'async';

    const asyncServiceDynamicResolvedValue = 'foobar';
    const asyncServiceDynamicValue = Promise.resolve(asyncServiceDynamicResolvedValue);
    const asyncServiceDynamicValueCallback = sinon.spy(() => asyncServiceDynamicValue);

    container
      .bind<string>(asyncServiceIdentifier)
      .toDynamicValue(asyncServiceDynamicValueCallback)
      .inSingletonScope();

    const serviceFromGetAsync = await container.getAsync(asyncServiceIdentifier);

    await asyncServiceDynamicValue;

    const serviceFromGet = container.get(asyncServiceIdentifier);

    expect(asyncServiceDynamicValueCallback.callCount).to.eq(1);
    expect(serviceFromGetAsync).eql(asyncServiceDynamicResolvedValue);
    expect(serviceFromGet).eql(asyncServiceDynamicResolvedValue);
  });
});