import interfaces from "../../src/interfaces/interfaces";
import { expect } from "chai";
import * as sinon from "sinon";
import resolve from "../../src/resolution/resolver";
import plan from "../../src/planning/planner";
import Kernel from "../../src/kernel/kernel";
import Request from "../../src/planning/request";
import TargetType from "../../src/planning/target_type";
import injectable from "../../src/annotation/injectable";
import inject from "../../src/annotation/inject";
import multiInject from "../../src/annotation/multi_inject";
import tagged from "../../src/annotation/tagged";
import named from "../../src/annotation/named";
import targetName from "../../src/annotation/target_name";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import BindingType from "../../src/bindings/binding_type";
import * as Proxy from "harmony-proxy";

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

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Shuriken>(shurikenId).to(Shuriken);
      kernel.bind<Katana>(katanaId).to(Katana);
      kernel.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
      kernel.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler);

      let context = plan(kernel, false, TargetType.Variable, ninjaId);
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

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Shuriken>(shurikenId).to(Shuriken);
      kernel.bind<Katana>(katanaId).to(Katana).inSingletonScope(); // SINGLETON!
      kernel.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
      kernel.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler).inSingletonScope(); // SINGLETON!

      let bindingDictionary: interfaces.Lookup<interfaces.Binding<any>> = (<any>kernel)._bindingDictionary;
      let context = plan(kernel, false, TargetType.Variable, ninjaId);

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

      // kernel and bindings
      let ninjaId = "Ninja";
      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId); // IMPORTAN! (Invalid binding)

      // context and plan
      let context = plan(kernel, false, TargetType.Variable, ninjaId);

      let throwFunction = () => {
          resolve(context);
      };

      expect(context.plan.rootRequest.bindings[0].type).eql(BindingType.Invalid);
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

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Shuriken>(shurikenId).to(Shuriken);
      kernel.bind<Katana>(katanaId).toConstantValue(new Katana(new KatanaHandler(), new KatanaBlade())); // IMPORTANT!

      let context = plan(kernel, false, TargetType.Variable, ninjaId);

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

    let kernel = new Kernel();
    kernel.bind<UseDate>("UseDate").to(UseDate);
    kernel.bind<Date>("Date").toDynamicValue((context: interfaces.Context) => { return new Date(); });

    let subject1 = kernel.get<UseDate>("UseDate");
    let subject2 = kernel.get<UseDate>("UseDate");
    expect(subject1.doSomething() === subject2.doSomething()).eql(false);

    kernel.unbind("Date");
    kernel.bind<Date>("Date").toConstantValue(new Date());

    let subject3 = kernel.get<UseDate>("UseDate");
    let subject4 = kernel.get<UseDate>("UseDate");
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

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Shuriken>(shurikenId).to(Shuriken);
      kernel.bind<Katana>(katanaId).to(Katana);
      kernel.bind<interfaces.Newable<Katana>>(newableKatanaId).toConstructor<Katana>(Katana);  // IMPORTANT!

      let context = plan(kernel, false, TargetType.Variable, ninjaId);
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

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Shuriken>(shurikenId).to(Shuriken);
      kernel.bind<Katana>(katanaId).to(Katana);
      kernel.bind<KatanaBlade>(bladeId).to(KatanaBlade);
      kernel.bind<KatanaHandler>(handlerId).to(KatanaHandler);

      kernel.bind<interfaces.Factory<Katana>>(swordFactoryId).toFactory<Katana>((context: interfaces.Context) => {
          return () => {
              return context.kernel.get<Katana>(katanaId);
          };
      });

      let context = plan(kernel, false, TargetType.Variable, ninjaId);

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

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Shuriken>(shurikenId).to(Shuriken);
      kernel.bind<Katana>(katanaId).to(Katana);
      kernel.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
      kernel.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler);
      kernel.bind<interfaces.Factory<Katana>>(katanaFactoryId).toAutoFactory<Katana>(katanaId);

      let context = plan(kernel, false, TargetType.Variable, ninjaId);
      let ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve BindingType.Provider bindings", (done) => {

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
          katana: Katana;
          katanaProvider: interfaces.Provider<Sword>;
          shuriken: Shuriken;
      }

      @injectable()
      class Ninja implements Warrior {
          public katana: Katana;
          public katanaProvider: interfaces.Provider<Sword>;
          public shuriken: Shuriken;
          public constructor(
              @inject(swordProviderId) @targetName("katanaProvider") katanaProvider: interfaces.Provider<Sword>,
              @inject(shurikenId) @targetName("shuriken") shuriken: Shuriken
          ) {
              this.katana = null;
              this.katanaProvider = katanaProvider;
              this.shuriken = shuriken;
          }
      }

      let kernel = new Kernel();
      kernel.bind<Warrior>(ninjaId).to(Ninja);
      kernel.bind<Shuriken>(shurikenId).to(Shuriken);
      kernel.bind<Sword>(swordId).to(Katana);
      kernel.bind<Blade>(bladeId).to(KatanaBlade);
      kernel.bind<Handler>(handlerId).to(KatanaHandler);

      kernel.bind<interfaces.Provider<Sword>>(swordProviderId).toProvider<Sword>((context: interfaces.Context) => {
          return () => {
              return new Promise<Sword>((resolve) => {
                  // Using setTimeout to simulate complex initialization
                  setTimeout(() => { resolve(context.kernel.get<Sword>(swordId)); }, 100);
              });
          };
      });

      let context = plan(kernel, false, TargetType.Variable, ninjaId);

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

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Weapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
      kernel.bind<Weapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);

      let context = plan(kernel, false, TargetType.Variable, ninjaId);

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

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Weapon>(weaponId).to(Katana).whenTargetNamed("strong");
      kernel.bind<Weapon>(weaponId).to(Shuriken).whenTargetNamed("weak");

      let context = plan(kernel, false, TargetType.Variable, ninjaId);

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

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);

      kernel.bind<Weapon>(weaponId).to(Katana).when((request: interfaces.Request) => {
          return request.target.name.equals("katana");
      });

      kernel.bind<Weapon>(weaponId).to(Shuriken).when((request: interfaces.Request) => {
          return request.target.name.equals("shuriken");
      });

      let context = plan(kernel, false, TargetType.Variable, ninjaId);

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

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Weapon>(weaponId).to(Katana);
      kernel.bind<Weapon>(weaponId).to(Shuriken);

      let context = plan(kernel, false, TargetType.Variable, ninjaId);

      let ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

      // if only one value is bound to weaponId
      let kernel2 = new Kernel();
      kernel2.bind<Ninja>(ninjaId).to(Ninja);
      kernel2.bind<Weapon>(weaponId).to(Katana);

      let context2 = plan(kernel2, false, TargetType.Variable, ninjaId);

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

        let kernel = new Kernel();
        kernel.bind<Ninja>(ninjaId).to(Ninja);

        // This is a global for unit testing but remember
        // that it is not a good idea to use globals
        let timeTracker: string[] = [];

        kernel.bind<Katana>(katanaId).to(Katana).onActivation((context: interfaces.Context, katana: Katana) => {
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

        let context = plan(kernel, false, TargetType.Variable, ninjaId);

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

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Shuriken>(shurikenId).to(Shuriken);

      let katanaFactory = function() {
          return new Katana(new KatanaHandler(), new KatanaBlade());
      };

      kernel.bind<KatanaFactory>(katanaFactoryId).toFunction(katanaFactory);

      let context = plan(kernel, false, TargetType.Variable, ninjaId);

      let ninja = resolve<Ninja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(typeof ninja.katanaFactory === "function").eql(true);
      expect(ninja.katanaFactory() instanceof Katana).eql(true);
      expect(ninja.katanaFactory().handler instanceof KatanaHandler).eql(true);
      expect(ninja.katanaFactory().blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

});
