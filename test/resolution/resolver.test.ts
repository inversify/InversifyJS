import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { resolve } from "../../src/resolution/resolver";
import { plan, getBindingDictionary } from "../../src/planning/planner";
import { Container } from "../../src/container/container";
import { TargetTypeEnum, BindingTypeEnum } from "../../src/constants/literal_types";
import { injectable } from "../../src/annotation/injectable";
import { inject } from "../../src/annotation/inject";
import { multiInject } from "../../src/annotation/multi_inject";
import { tagged } from "../../src/annotation/tagged";
import { named } from "../../src/annotation/named";
import { targetName } from "../../src/annotation/target_name";
import * as Proxy from "harmony-proxy";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import * as sinon from "sinon";

describe("Resolve", () => {

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Should be able to resolve BindingType.Instance bindings", () => {

      let ninjaId = "Ninja";
      let shurikenId = "Shuriken";
      let katanaId = "Katana";
      let katanaHandlerId = "KatanaHandler";
      let katanaBladeId = "KatanaBlade";

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

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Shuriken>(shurikenId).to(Shuriken);
      container.bind<Katana>(katanaId).to(Katana);
      container.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
      container.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler);

      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);
      let ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should store singleton type bindings in cache", () => {

      let ninjaId = "Ninja";
      let shurikenId = "Shuriken";
      let katanaId = "Katana";
      let katanaHandlerId = "KatanaHandler";
      let katanaBladeId = "KatanaBlade";

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

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Shuriken>(shurikenId).to(Shuriken);
      container.bind<Katana>(katanaId).to(Katana).inSingletonScope(); // SINGLETON!
      container.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
      container.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler).inSingletonScope(); // SINGLETON!

      let bindingDictionary = getBindingDictionary(container);
      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);

      expect(bindingDictionary.get(katanaId)[0].cache === null).eql(true);
      let ninja = resolve<Ninja>(context);
      expect(ninja instanceof Ninja).eql(true);

      let ninja2 = resolve<Ninja>(context);
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
      let ninjaId = "Ninja";
      let container = new Container();
      container.bind<Ninja>(ninjaId); // IMPORTAN! (Invalid binding)

      // context and plan
      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);

      let throwFunction = () => {
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

      let ninjaId = "Ninja";
      let shurikenId = "Shuriken";
      let katanaId = "Katana";

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Shuriken>(shurikenId).to(Shuriken);
      container.bind<Katana>(katanaId).toConstantValue(new Katana(new KatanaHandler(), new KatanaBlade())); // IMPORTANT!

      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);

      let ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve BindingType.DynamicValue bindings", () => {

    interface UseDate {
        doSomething(): Date;
    }

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

    let container = new Container();
    container.bind<UseDate>("UseDate").to(UseDate);
    container.bind<Date>("Date").toDynamicValue((context: interfaces.Context) => { return new Date(); });

    let subject1 = container.get<UseDate>("UseDate");
    let subject2 = container.get<UseDate>("UseDate");
    expect(subject1.doSomething() === subject2.doSomething()).eql(false);

    container.unbind("Date");
    container.bind<Date>("Date").toConstantValue(new Date());

    let subject3 = container.get<UseDate>("UseDate");
    let subject4 = container.get<UseDate>("UseDate");
    expect(subject3.doSomething() === subject4.doSomething()).eql(true);

  });

  it("Should be able to resolve BindingType.Constructor bindings", () => {

      let ninjaId = "Ninja";
      let shurikenId = "Shuriken";
      let katanaId = "Katana";
      let newableKatanaId = "Newable<Katana>";
      let katanaHandlerId = "KatanaHandler";
      let katanaBladeId = "KatanaBlade";

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

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Shuriken>(shurikenId).to(Shuriken);
      container.bind<Katana>(katanaId).to(Katana);
      container.bind<interfaces.Newable<Katana>>(newableKatanaId).toConstructor<Katana>(Katana);  // IMPORTANT!

      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);
      let ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve BindingType.Factory bindings", () => {

      let ninjaId = "Ninja";
      let shurikenId = "Shuriken";
      let swordFactoryId = "Factory<Sword>";
      let katanaId = "Katana";
      let handlerId = "Handler";
      let bladeId = "Blade";

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

      interface SwordFactory extends Function {
          (): Sword;
      }

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

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Shuriken>(shurikenId).to(Shuriken);
      container.bind<Katana>(katanaId).to(Katana);
      container.bind<KatanaBlade>(bladeId).to(KatanaBlade);
      container.bind<KatanaHandler>(handlerId).to(KatanaHandler);

      container.bind<interfaces.Factory<Katana>>(swordFactoryId).toFactory<Katana>((context: interfaces.Context) => {
          return () => {
              return context.container.get<Katana>(katanaId);
          };
      });

      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);

      let ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve bindings with auto factory", () => {

      let ninjaId = "Ninja";
      let shurikenId = "Shuriken";
      let katanaFactoryId = "Factory<Sword>";
      let katanaId = "Katana";
      let katanaHandlerId = "KatanaHandler";
      let katanaBladeId = "KatanaBlade";

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

      interface SwordFactory extends Function {
          (): Sword;
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
              @inject(katanaFactoryId) @targetName("makeKatana") makeKatana: SwordFactory,
              @inject(shurikenId) @targetName("shuriken") shuriken: Shuriken
          ) {
              this.katana = makeKatana(); // IMPORTANT!
              this.shuriken = shuriken;
          }
      }

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Shuriken>(shurikenId).to(Shuriken);
      container.bind<Katana>(katanaId).to(Katana);
      container.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
      container.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler);
      container.bind<interfaces.Factory<Katana>>(katanaFactoryId).toAutoFactory<Katana>(katanaId);

      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);
      let ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve BindingType.Provider bindings", (done) => {

      type SwordProvider = () => Promise<Sword>;

      let ninjaId = "Ninja";
      let shurikenId = "Shuriken";
      let swordProviderId = "Provider<Sword>";
      let swordId = "Sword";
      let handlerId = "Handler";
      let bladeId = "Blade";

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

      let container = new Container();
      container.bind<Warrior>(ninjaId).to(Ninja);
      container.bind<Shuriken>(shurikenId).to(Shuriken);
      container.bind<Sword>(swordId).to(Katana);
      container.bind<Blade>(bladeId).to(KatanaBlade);
      container.bind<Handler>(handlerId).to(KatanaHandler);

      container.bind<SwordProvider>(swordProviderId).toProvider<Sword>((context: interfaces.Context) => {
          return () => {
              return new Promise<Sword>((resolve) => {
                  // Using setTimeout to simulate complex initialization
                  setTimeout(() => { resolve(context.container.get<Sword>(swordId)); }, 100);
              });
          };
      });

      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);

      let ninja = resolve<Warrior>(context);

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

      let ninjaId = "Ninja";
      let weaponId = "Weapon";

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Weapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
      container.bind<Weapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);

      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);

      let ninja = resolve<Ninja>(context);

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

      let ninjaId = "Ninja";
      let weaponId = "Weapon";

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Weapon>(weaponId).to(Katana).whenTargetNamed("strong");
      container.bind<Weapon>(weaponId).to(Shuriken).whenTargetNamed("weak");

      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);

      let ninja = resolve<Ninja>(context);

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

      let ninjaId = "Ninja";
      let weaponId = "Weapon";

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);

      container.bind<Weapon>(weaponId).to(Katana).when((request: interfaces.Request) => {
          return request.target.name.equals("katana");
      });

      container.bind<Weapon>(weaponId).to(Shuriken).when((request: interfaces.Request) => {
        return request.target.name.equals("shuriken");
      });

      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);

      let ninja = resolve<Ninja>(context);

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

      let ninjaId = "Ninja";
      let weaponId = "Weapon";

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Weapon>(weaponId).to(Katana);
      container.bind<Weapon>(weaponId).to(Shuriken);

      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);

      let ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

      // if only one value is bound to weaponId
      let container2 = new Container();
      container2.bind<Ninja>(ninjaId).to(Ninja);
      container2.bind<Weapon>(weaponId).to(Katana);

      let context2 = plan(container2, false, TargetTypeEnum.Variable, ninjaId);

      let ninja2 = resolve<Ninja>(context2);

      expect(ninja2 instanceof Ninja).eql(true);
      expect(ninja2.katana instanceof Katana).eql(true);

  });

  it("Should be able to resolve plans with activation handlers", () => {

        interface Sword {
            use: () => void;
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

        let ninjaId = "Ninja";
        let katanaId = "Katana";

        let container = new Container();
        container.bind<Ninja>(ninjaId).to(Ninja);

        // This is a global for unit testing but remember
        // that it is not a good idea to use globals
        let timeTracker: string[] = [];

        container.bind<Katana>(katanaId).to(Katana).onActivation((context: interfaces.Context, katana: Katana) => {
            let handler = {
                apply: function(target: any, thisArgument: any, argumentsList: any[]) {
                    timeTracker.push(`Starting ${target.name} ${new Date().getTime()}`);
                    let result = target.apply(thisArgument, argumentsList);
                    timeTracker.push(`Finished ${target.name} ${new Date().getTime()}`);
                    return result;
                }
            };
            /// create a proxy for method use() own by katana instance about to be injected
            katana.use = new Proxy(katana.use, handler);
            return katana;
        });

        let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);

        let ninja = resolve<Ninja>(context);

        expect(ninja.katana.use()).eql("Used Katana!");
        expect(Array.isArray(timeTracker)).eql(true);
        expect(timeTracker.length).eql(2);

  });

  it("Should be able to resolve BindingType.Function bindings", () => {

      let ninjaId = "Ninja";
      let shurikenId = "Shuriken";
      let katanaFactoryId = "KatanaFactory";

      interface KatanaFactory extends Function {
          (): Katana;
      }

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
          public katanaFactory: KatanaFactory;
          public shuriken: Shuriken;
          public constructor(
              @inject(katanaFactoryId) @targetName("katana") katanaFactory: KatanaFactory,
              @inject(shurikenId) @targetName("shuriken") shuriken: Shuriken
          ) {
              this.katanaFactory = katanaFactory;
              this.shuriken = shuriken;
          }
      }

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Shuriken>(shurikenId).to(Shuriken);

      let katanaFactory = function() {
          return new Katana(new KatanaHandler(), new KatanaBlade());
      };

      container.bind<KatanaFactory>(katanaFactoryId).toFunction(katanaFactory);

      let context = plan(container, false, TargetTypeEnum.Variable, ninjaId);

      let ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(typeof ninja.katanaFactory === "function").eql(true);
      expect(ninja.katanaFactory() instanceof Katana).eql(true);
      expect(ninja.katanaFactory().handler instanceof KatanaHandler).eql(true);
      expect(ninja.katanaFactory().blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

});
