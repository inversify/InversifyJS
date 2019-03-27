import { expect } from "chai";
import * as Proxy from "harmony-proxy";
import * as sinon from "sinon";
import { inject } from "../../src/annotation/inject";
import { injectable } from "../../src/annotation/injectable";
import { multiInject } from "../../src/annotation/multi_inject";
import { named } from "../../src/annotation/named";
import { postConstruct } from "../../src/annotation/post_construct";
import { tagged } from "../../src/annotation/tagged";
import { targetName } from "../../src/annotation/target_name";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import { BindingTypeEnum, TargetTypeEnum } from "../../src/constants/literal_types";
import { Container } from "../../src/container/container";
import { interfaces } from "../../src/interfaces/interfaces";
import { MetadataReader } from "../../src/planning/metadata_reader";
import { getBindingDictionary, plan } from "../../src/planning/planner";
import { resolveInstance } from "../../src/resolution/instantiation";
import { resolve } from "../../src/resolution/resolver";

describe("Resolve", () => {

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Should be able to resolve BindingType.Instance bindings", () => {

      const ninjaId = "Ninja";
      const shurikenId = "Shuriken";
      const katanaId = "Katana";
      const katanaHandlerId = "KatanaHandler";
      const katanaBladeId = "KatanaBlade";

      interface Blade {}

      @injectable()
      class KatanaBlade implements Blade {}

      interface Handler {}

      @injectable()
      class KatanaHandler implements Handler {}

      interface Sword {
          handler: KatanaHandler;
          blade: KatanaBlade;
      }

      @injectable()
      class Katana implements Sword {
          public handler: Handler;
          public blade: Blade;
          public constructor(
              @inject(katanaHandlerId) @targetName("handler") handler: Handler,
              @inject(katanaBladeId) @targetName("blade") blade: Blade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface Shuriken {}

      @injectable()
      class Shuriken implements Shuriken {}

      interface Warrior {
          katana: Katana;
          shuriken: Shuriken;
      }

      @injectable()
      class Ninja implements Warrior {
          public katana: Katana;
          public shuriken: Shuriken;
          public constructor(
              @inject(katanaId) @targetName("katana") katana: Katana,
              @inject(shurikenId) @targetName("shuriken") shuriken: Shuriken
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
      const ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should store singleton type bindings in cache", () => {

      const ninjaId = "Ninja";
      const shurikenId = "Shuriken";
      const katanaId = "Katana";
      const katanaHandlerId = "KatanaHandler";
      const katanaBladeId = "KatanaBlade";

      interface Blade {}

      @injectable()
      class KatanaBlade implements Blade {}

      interface Handler {}

      @injectable()
      class KatanaHandler implements Handler {}

      interface Sword {
          handler: KatanaHandler;
          blade: KatanaBlade;
      }

      @injectable()
      class Katana implements Sword {
          public handler: Handler;
          public blade: Blade;
          public constructor(
              @inject(katanaHandlerId) @targetName("handler") handler: Handler,
              @inject(katanaBladeId) @targetName("blade") blade: Blade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface Shuriken {}

      @injectable()
      class Shuriken implements Shuriken {}

      interface Warrior {
          katana: Katana;
          shuriken: Shuriken;
      }

      @injectable()
      class Ninja implements Warrior {
          public katana: Katana;
          public shuriken: Shuriken;
          public constructor(
              @inject(katanaId) @targetName("katana") katana: Katana,
              @inject(shurikenId) @targetName("shuriken") shuriken: Shuriken
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

      expect(bindingDictionary.get(katanaId)[0].cache === null).eql(true);
      const ninja = resolve<Ninja>(context);
      expect(ninja instanceof Ninja).eql(true);

      const ninja2 = resolve<Ninja>(context);
      expect(ninja2 instanceof Ninja).eql(true);

      expect(bindingDictionary.get(katanaId)[0].cache instanceof Katana).eql(true);

  });

  it("Should throw when an invalid BindingType is detected", () => {

      interface Katana {}

      @injectable()
      class Katana implements Katana {}

      interface Shuriken {}

      @injectable()
      class Shuriken implements Shuriken {}

      interface Warrior {
          katana: Katana;
          shuriken: Shuriken;
      }

      @injectable()
      class Ninja implements Warrior {
          public katana: Katana;
          public shuriken: Shuriken;
          public constructor(
              @inject("Katana") @targetName("katana") katana: Katana,
              @inject("Shuriken") @targetName("shuriken") shuriken: Shuriken
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      // container and bindings
      const ninjaId = "Ninja";
      const container = new Container();
      container.bind<Ninja>(ninjaId); // IMPORTANT! (Invalid binding)

      // context and plan
      const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

      const throwFunction = () => {
          resolve(context);
      };

      expect(context.plan.rootRequest.bindings[0].type).eql(BindingTypeEnum.Invalid);
      expect(throwFunction).to.throw(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${ninjaId}`);

  });

  it("Should be able to resolve BindingType.ConstantValue bindings", () => {

      interface KatanaBlade {}

      @injectable()
      class KatanaBlade implements KatanaBlade {}

      interface KatanaHandler {}

      @injectable()
      class KatanaHandler implements KatanaHandler {}

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

      interface Shuriken {}

      @injectable()
      class Shuriken implements Shuriken {}

      interface Warrior {
          katana: Katana;
          shuriken: Shuriken;
      }

      @injectable()
      class Ninja implements Warrior {
          public katana: Katana;
          public shuriken: Shuriken;
          public constructor(
              @inject("Katana") @targetName("katana") katana: Katana,
              @inject("Shuriken") @targetName("shuriken") shuriken: Shuriken
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      const ninjaId = "Ninja";
      const shurikenId = "Shuriken";
      const katanaId = "Katana";

      const container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Shuriken>(shurikenId).to(Shuriken);
      container.bind<Katana>(katanaId).toConstantValue(new Katana(new KatanaHandler(), new KatanaBlade())); // IMPORTANT!

      const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

      const ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should only call parent async singleton once within child containers", async () => {
    const parent = new Container();
    parent.bind<Date>("Parent").toAsyncValue(() => Promise.resolve(new Date())).inSingletonScope();

    const child1 = parent.createChild();
    child1.bind<Date>("Child").toAsyncValue((context: interfaces.Context) => context.container.getAsync("Parent"));

    const child2 = parent.createChild();
    child2.bind<Date>("Child").toAsyncValue((context: interfaces.Context) => context.container.getAsync("Parent"));

    const subject1 = await child1.getAsync<Date>("Child");
    const subject2 = await child2.getAsync<Date>("Child");
    expect(subject1 === subject2).eql(true);
  });

  it("Should only call async method once if marked as singleton (indirect)", async () => {
      @injectable()
      class UseDate implements UseDate {
          public currentDate: Date;
          public constructor(@inject("Date") currentDate: Date) {
              expect(currentDate).instanceOf(Date);

              this.currentDate = currentDate;
          }
          public doSomething() {
              return this.currentDate;
          }
      }

      const container = new Container();
      container.bind<UseDate>("UseDate").to(UseDate);
      container.bind<Date>("Date").toAsyncValue(() => Promise.resolve(new Date())).inSingletonScope();

      const subject1 = await container.getAsync<UseDate>("UseDate");
      const subject2 = await container.getAsync<UseDate>("UseDate");
      expect(subject1.doSomething() === subject2.doSomething()).eql(true);
  });

  it("Should be able to mix BindingType.AsyncValue bindings with non-async values", async () => {
      @injectable()
      class UseDate implements UseDate {
          public currentDate: Date;
          public foobar: string;

          public constructor(@inject("Date") currentDate: Date, @inject("Static") foobar: string) {
              expect(currentDate).instanceOf(Date);

              this.currentDate = currentDate;
              this.foobar = foobar;
          }
      }

      const container = new Container();
      container.bind<UseDate>("UseDate").to(UseDate);
      container.bind<Date>("Date").toAsyncValue(() => Promise.resolve(new Date()));
      container.bind<string>("Static").toConstantValue("foobar");

      const subject1 = await container.getAsync<UseDate>("UseDate");
      expect(subject1.foobar).eql("foobar");
  });

  it("Should throw exception if using sync API with async dependencies", async () => {
      @injectable()
      class UseDate implements UseDate {
          public currentDate: Date;
          public constructor(@inject("Date") currentDate: Date) {
              expect(currentDate).instanceOf(Date);

              this.currentDate = currentDate;
          }
          public doSomething() {
              return this.currentDate;
          }
      }

      const container = new Container();
      container.bind<UseDate>("UseDate").to(UseDate);
      container.bind<Date>("Date").toAsyncValue(() => Promise.resolve(new Date()));

      expect(() => container.get<UseDate>("UseDate")).to.throw(`You are attempting to construct 'UseDate' in a synchronous way
 but it has asynchronous dependencies.`);
  });

  it("Should be able to resolve indirect BindingType.AsyncValue bindings", async () => {
      @injectable()
      class UseDate implements UseDate {
          public currentDate: Date;
          public constructor(@inject("Date") currentDate: Date) {
              expect(currentDate).instanceOf(Date);

              this.currentDate = currentDate;
          }
          public doSomething() {
              return this.currentDate;
          }
      }

      const container = new Container();
      container.bind<UseDate>("UseDate").to(UseDate);
      container.bind<Date>("Date").toAsyncValue(() => Promise.resolve(new Date()));

      const subject1 = await container.getAsync<UseDate>("UseDate");
      const subject2 = await container.getAsync<UseDate>("UseDate");
      expect(subject1.doSomething() === subject2.doSomething()).eql(false);
  });

  it("Should be able to modify async return values with onActivation", async () => {
      const container = new Container();
      container.bind<string>("async").toAsyncValue(() => Promise.resolve("foobar")).onActivation((context, val) => {
          expect(val).eql("foobar");

          return "foobaz";
      });

      const value = await container.getAsync<string>("async");
      expect(value).eql("foobaz");
  });

  it("Should be able to resolve direct BindingType.AsyncValue bindings", async () => {
      const container = new Container();
      container.bind<string>("async").toAsyncValue(() => Promise.resolve("foobar"));

      const value = await container.getAsync<string>("async");
      expect(value).eql("foobar");
  });

  it("Should error if trying to resolve an BindingType.AsyncValue in sync API", () => {
      const container = new Container();
      container.bind<string>("async").toAsyncValue(() => Promise.resolve("foobar"));

      expect(() => container.get<string>("async")).to.throw(`You are attempting to construct 'async' in a synchronous way
 but it has asynchronous dependencies.`);
  });

  it("Should be able to resolve BindingType.DynamicValue bindings", () => {
    @injectable()
    class UseDate implements UseDate {
        public currentDate: Date;
        public constructor(@inject("Date") currentDate: Date) {
            this.currentDate = currentDate;
        }
        public doSomething() {
            return this.currentDate;
        }
    }

    const container = new Container();
    container.bind<UseDate>("UseDate").to(UseDate);
    container.bind<Date>("Date").toDynamicValue((context: interfaces.Context) => new Date());

    const subject1 = container.get<UseDate>("UseDate");
    const subject2 = container.get<UseDate>("UseDate");
    expect(subject1.doSomething() === subject2.doSomething()).eql(false);

    container.unbind("Date");
    container.bind<Date>("Date").toConstantValue(new Date());

    const subject3 = container.get<UseDate>("UseDate");
    const subject4 = container.get<UseDate>("UseDate");
    expect(subject3.doSomething() === subject4.doSomething()).eql(true);

  });

  it("Should be able to resolve BindingType.Constructor bindings", () => {

      const ninjaId = "Ninja";
      const shurikenId = "Shuriken";
      const katanaId = "Katana";
      const newableKatanaId = "Newable<Katana>";
      const katanaHandlerId = "KatanaHandler";
      const katanaBladeId = "KatanaBlade";

      interface KatanaBlade {}

      @injectable()
      class KatanaBlade implements KatanaBlade {}

      interface KatanaHandler {}

      @injectable()
      class KatanaHandler implements KatanaHandler {}

      interface Sword {
          handler: KatanaHandler;
          blade: KatanaBlade;
      }

      @injectable()
      class Katana implements Sword {
          public handler: KatanaHandler;
          public blade: KatanaBlade;
          public constructor(
              @inject(katanaHandlerId) @targetName("handler") handler: KatanaHandler,
              @inject(katanaBladeId) @targetName("blade") blade: KatanaBlade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface Shuriken {}

      @injectable()
      class Shuriken implements Shuriken {}

      interface Warrior {
          katana: Katana;
          shuriken: Shuriken;
      }

      @injectable()
      class Ninja implements Warrior {
          public katana: Katana;
          public shuriken: Shuriken;
          public constructor(
              @inject(newableKatanaId) @targetName("katana") katana: Katana,
              @inject(shurikenId) @targetName("shuriken") shuriken: Shuriken
          ) {
              this.katana = new Katana(new KatanaHandler(), new KatanaBlade());  // IMPORTANT!
              this.shuriken = shuriken;
          }
      }

      const container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Shuriken>(shurikenId).to(Shuriken);
      container.bind<Katana>(katanaId).to(Katana);
      container.bind<interfaces.Newable<Katana>>(newableKatanaId).toConstructor<Katana>(Katana);  // IMPORTANT!

      const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);
      const ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve BindingType.Factory bindings", () => {

      const ninjaId = "Ninja";
      const shurikenId = "Shuriken";
      const swordFactoryId = "Factory<Sword>";
      const katanaId = "Katana";
      const handlerId = "Handler";
      const bladeId = "Blade";

      interface Blade {}

      @injectable()
      class KatanaBlade implements Blade {}

      interface Handler {}

      @injectable()
      class KatanaHandler implements Handler {}

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
              @inject(handlerId) @targetName("handler") handler: Handler,
              @inject(bladeId) @targetName("blade") blade: Blade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface Shuriken {}

      @injectable()
      class Shuriken implements Shuriken {}

      interface Warrior {
          katana: Katana;
          shuriken: Shuriken;
      }

      @injectable()
      class Ninja implements Warrior {
          public katana: Katana;
          public shuriken: Shuriken;
          public constructor(
              @inject(swordFactoryId) @targetName("makeKatana") makeKatana: SwordFactory,
              @inject(shurikenId) @targetName("shuriken") shuriken: Shuriken
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

      const ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve bindings with auto factory", () => {

      const ninjaId = "Ninja";
      const shurikenId = "Shuriken";
      const katanaFactoryId = "Factory<Sword>";
      const katanaId = "Katana";
      const katanaHandlerId = "KatanaHandler";
      const katanaBladeId = "KatanaBlade";

      interface KatanaBlade {}

      @injectable()
      class KatanaBlade implements KatanaBlade {}

      interface KatanaHandler {}

      @injectable()
      class KatanaHandler implements KatanaHandler {}

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
              @inject(katanaHandlerId) @targetName("handler") handler: KatanaHandler,
              @inject(katanaBladeId) @targetName("blade") blade: KatanaBlade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface Shuriken {}

      @injectable()
      class Shuriken implements Shuriken {}

      interface Warrior {
          katana: Katana;
          shuriken: Shuriken;
      }

      @injectable()
      class Ninja implements Warrior {
          public katana: Katana;
          public shuriken: Shuriken;
          public constructor(
              @inject(katanaFactoryId) @targetName("makeKatana") makeKatana: SwordFactory,
              @inject(shurikenId) @targetName("shuriken") shuriken: Shuriken
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
      const ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve BindingType.Provider bindings", (done) => {

      type SwordProvider = () => Promise<Sword>;

      const ninjaId = "Ninja";
      const shurikenId = "Shuriken";
      const swordProviderId = "Provider<Sword>";
      const swordId = "Sword";
      const handlerId = "Handler";
      const bladeId = "Blade";

      interface Blade {}

      @injectable()
      class KatanaBlade implements Blade {}

      interface Handler {}

      @injectable()
      class KatanaHandler implements Handler {}

      interface Sword {
          handler: Handler;
          blade: Blade;
      }

      @injectable()
      class Katana implements Sword {
          public handler: Handler;
          public blade: Blade;
          public constructor(
              @inject(handlerId) @targetName("handler") handler: Handler,
              @inject(bladeId) @targetName("handler") blade: Blade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface Shuriken {}

      @injectable()
      class Shuriken implements Shuriken {}

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
              @inject(swordProviderId) @targetName("katanaProvider") katanaProvider: SwordProvider,
              @inject(shurikenId) @targetName("shuriken") shuriken: Shuriken
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

      const ninja = resolve<Warrior>(context);

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

  it("Should be able to resolve plans with constraints on tagged targets", () => {

      interface Weapon {}

      @injectable()
      class Katana implements Weapon { }

      @injectable()
      class Shuriken implements Weapon {}

      interface Warrior {
          katana: Weapon;
          shuriken: Weapon;
      }

      @injectable()
      class Ninja implements Warrior {
          public katana: Weapon;
          public shuriken: Weapon;
          public constructor(
              @inject("Weapon") @targetName("katana") @tagged("canThrow", false) katana: Weapon,
              @inject("Weapon") @targetName("shuriken") @tagged("canThrow", true) shuriken: Weapon
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      const ninjaId = "Ninja";
      const weaponId = "Weapon";

      const container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Weapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
      container.bind<Weapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);

      const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

      const ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve plans with constraints on named targets", () => {

      interface Weapon {}

      @injectable()
      class Katana implements Weapon {}

      @injectable()
      class Shuriken implements Weapon {}

      interface Warrior {
          katana: Weapon;
          shuriken: Weapon;
      }

      @injectable()
      class Ninja implements Warrior {
          public katana: Weapon;
          public shuriken: Weapon;
          public constructor(
              @inject("Weapon") @targetName("katana") @named("strong")katana: Weapon,
              @inject("Weapon") @targetName("shuriken") @named("weak") shuriken: Weapon
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      const ninjaId = "Ninja";
      const weaponId = "Weapon";

      const container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Weapon>(weaponId).to(Katana).whenTargetNamed("strong");
      container.bind<Weapon>(weaponId).to(Shuriken).whenTargetNamed("weak");

      const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

      const ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve plans with custom contextual constraints", () => {

      interface Weapon {}

      @injectable()
      class Katana implements Weapon {}

      @injectable()
      class Shuriken implements Weapon {}

      interface Warrior {
          katana: Weapon;
          shuriken: Weapon;
      }

      @injectable()
      class Ninja implements Warrior {
          public katana: Weapon;
          public shuriken: Weapon;
          public constructor(
              @inject("Weapon") @targetName("katana") katana: Weapon,
              @inject("Weapon") @targetName("shuriken") shuriken: Weapon
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      const ninjaId = "Ninja";
      const weaponId = "Weapon";

      const container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);

      container.bind<Weapon>(weaponId).to(Katana).when((request: interfaces.Request) =>
          request.target.name.equals("katana"));

      container.bind<Weapon>(weaponId).to(Shuriken).when((request: interfaces.Request) =>
        request.target.name.equals("shuriken"));

      const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

      const ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);
  });

  it("Should be able to resolve plans with multi-injections", () => {

      interface Weapon {
          name: string;
      }

      @injectable()
      class Katana implements Weapon {
          public name = "Katana";
      }

      @injectable()
      class Shuriken implements Weapon {
          public name = "Shuriken";
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
              @multiInject("Weapon") @targetName("weapons") weapons: Weapon[]
          ) {
              this.katana = weapons[0];
              this.shuriken = weapons[1];
          }
      }

      const ninjaId = "Ninja";
      const weaponId = "Weapon";

      const container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Weapon>(weaponId).to(Katana);
      container.bind<Weapon>(weaponId).to(Shuriken);

      const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

      const ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

      // if only one value is bound to weaponId
      const container2 = new Container();
      container2.bind<Ninja>(ninjaId).to(Ninja);
      container2.bind<Weapon>(weaponId).to(Katana);

      const context2 = plan(new MetadataReader(), container2, false, TargetTypeEnum.Variable, ninjaId);

      const ninja2 = resolve<Ninja>(context2);

      expect(ninja2 instanceof Ninja).eql(true);
      expect(ninja2.katana instanceof Katana).eql(true);

  });

  it("Should be able to resolve plans with activation handlers", () => {

        interface Sword {
            use(): void;
        }

        @injectable()
        class Katana implements Sword {
            public use() {
                return "Used Katana!";
            }
        }

        interface Warrior {
            katana: Katana;
        }

        @injectable()
        class Ninja implements Warrior {
            public katana: Katana;
            public constructor(
                @inject("Katana") katana: Katana
            ) {
                this.katana = katana;
            }
        }

        const ninjaId = "Ninja";
        const katanaId = "Katana";

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

        const ninja = resolve<Ninja>(context);

        expect(ninja.katana.use()).eql("Used Katana!");
        expect(Array.isArray(timeTracker)).eql(true);
        expect(timeTracker.length).eql(2);

  });

  it("Should be able to resolve BindingType.Function bindings", () => {

      const ninjaId = "Ninja";
      const shurikenId = "Shuriken";
      const katanaFactoryId = "KatanaFactory";

      type KatanaFactory = () => Katana;

      interface KatanaBlade {}

      @injectable()
      class KatanaBlade implements KatanaBlade {}

      interface KatanaHandler {}

      @injectable()
      class KatanaHandler implements KatanaHandler {}

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

      interface Shuriken {}

      @injectable()
      class Shuriken implements Shuriken {}

      interface Warrior {
          katanaFactory: KatanaFactory;
          shuriken: Shuriken;
      }

      @injectable()
      class Ninja implements Warrior {
          public constructor(
              @inject(katanaFactoryId) @targetName("katana") public katanaFactory: KatanaFactory,
              @inject(shurikenId) @targetName("shuriken") public shuriken: Shuriken
          ) {
          }
      }

      const container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Shuriken>(shurikenId).to(Shuriken);

      const katanaFactoryInstance = function() {
          return new Katana(new KatanaHandler(), new KatanaBlade());
      };

      container.bind<KatanaFactory>(katanaFactoryId).toFunction(katanaFactoryInstance);

      const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

      const ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(typeof ninja.katanaFactory === "function").eql(true);
      expect(ninja.katanaFactory() instanceof Katana).eql(true);
      expect(ninja.katanaFactory().handler instanceof KatanaHandler).eql(true);
      expect(ninja.katanaFactory().blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

    });

  it("Should run the @PostConstruct method", () => {

        interface Sword {
            use(): string;
        }

        @injectable()
        class Katana implements Sword {
            private useMessage: string;

            public use() {
                return this.useMessage;
            }

            @postConstruct()
            public postConstruct () {
                this.useMessage = "Used Katana!";
            }
        }

        interface Warrior {
            katana: Katana;
        }

        @injectable()
        class Ninja implements Warrior {
            public katana: Katana;
            public constructor(@inject("Katana") katana: Katana) {
                this.katana = katana;
            }
        }
        const ninjaId = "Ninja";
        const katanaId = "Katana";

        const container = new Container();
        container.bind<Ninja>(ninjaId).to(Ninja);

        container.bind<Katana>(katanaId).to(Katana);

        const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

        const ninja = resolve<Ninja>(context);

        expect(ninja.katana.use()).eql("Used Katana!");

    });

  it("Should throw an error if the @postConstruct method throws an error", () => {

        @injectable()
        class Katana {

            @postConstruct()
            public postConstruct() {
                throw new Error("Original Message");
            }
        }

        expect(resolveInstance.bind(resolveInstance, Katana, [], (request: interfaces.Request) => null))
            .to.throw("@postConstruct error in class Katana: Original Message");
    });

  it("Should run the @PostConstruct method of parent class", () => {

        interface Weapon {
            use(): string;
        }

        @injectable()
        abstract class Sword implements Weapon {
            protected useMessage: string;

            @postConstruct()
            public postConstruct () {
                this.useMessage = "Used Weapon!";
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
            public constructor(@inject("Katana") katana: Katana) {
                this.katana = katana;
            }
        }
        const ninjaId = "Ninja";
        const katanaId = "Katana";

        const container = new Container();
        container.bind<Ninja>(ninjaId).to(Ninja);

        container.bind<Katana>(katanaId).to(Katana);

        const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable, ninjaId);

        const ninja = resolve<Ninja>(context);

        expect(ninja.katana.use()).eql("Used Weapon!");

    });

  it("Should run the @PostConstruct method once in the singleton scope", () => {
        let timesCalled = 0;
        @injectable()
        class Katana {
            @postConstruct()
            public postConstruct () {
                timesCalled ++;
            }
        }

        @injectable()
        class Ninja {
            public katana: Katana;
            public constructor(@inject("Katana") katana: Katana) {
                this.katana = katana;
            }
        }

        @injectable()
        class Samurai  {
            public katana: Katana;
            public constructor(@inject("Katana") katana: Katana) {
                this.katana = katana;
            }
        }
        const ninjaId = "Ninja";
        const samuraiId = "Samurai";
        const katanaId = "Katana";

        const container = new Container();
        container.bind<Ninja>(ninjaId).to(Ninja);
        container.bind<Samurai>(samuraiId).to(Samurai);
        container.bind<Katana>(katanaId).to(Katana).inSingletonScope();
        container.get(ninjaId);
        container.get(samuraiId);
        expect(timesCalled).to.be.equal(1);

  });

});
