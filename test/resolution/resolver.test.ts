///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import * as sinon from "sinon";
import Resolver from "../../src/resolution/resolver";
import Planner from "../../src/planning/planner";
import Kernel from "../../src/kernel/kernel";
import Request from "../../src/planning/request";
import Plan from "../../src/planning/plan";
import Target from "../../src/planning/target";
import injectable from "../../src/annotation/injectable";
import inject from "../../src/annotation/inject";
import multiInject from "../../src/annotation/multi_inject";
import tagged from "../../src/annotation/tagged";
import named from "../../src/annotation/named";
import targetName from "../../src/annotation/target_name";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import BindingType from "../../src/bindings/binding_type";
import * as Proxy from "harmony-proxy";

describe("Resolver", () => {

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Should be able to resolve BindingType.Instance bindings", () => {

      interface IKatanaBlade {}

      @injectable()
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}

      @injectable()
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      @injectable()
      class Katana implements IKatana {
          public handler: IKatanaHandler;
          public blade: IKatanaBlade;
          public constructor(
              @inject("IKatanaHandler") @targetName("handler") handler: IKatanaHandler,
              @inject("IKatanaBlade") @targetName("blade") blade: IKatanaBlade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface IShuriken {}

      @injectable()
      class Shuriken implements IShuriken {}

      interface INinja {
          katana: IKatana;
          shuriken: IShuriken;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(
              @inject("IKatana") @targetName("katana") katana: IKatana,
              @inject("IShuriken") @targetName("shuriken") shuriken: IShuriken
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      let ninjaId = "INinja";
      let shurikenId = "IShuriken";
      let katanaId = "IKatana";
      let katanaHandlerId = "IKatanaHandler";
      let katanaBladeId = "IKatanaBlade";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);
      kernel.bind<IKatana>(katanaId).to(Katana);
      kernel.bind<IKatanaBlade>(katanaBladeId).to(KatanaBlade);
      kernel.bind<IKatanaHandler>(katanaHandlerId).to(KatanaHandler);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let katanaBinding = _kernel._bindingDictionary.get(katanaId)[0];
      let katanaHandlerBinding = _kernel._bindingDictionary.get(katanaHandlerId)[0];
      let katanaBladeBinding = _kernel._bindingDictionary.get(katanaBladeId)[0];
      let shurikenBinding = _kernel._bindingDictionary.get(shurikenId)[0];

      let planner = new Planner();
      let context = planner.createContext(kernel);

      /*
      *  Plan (request tree):
      *
      *  Ninja (target "null", no metadata)
      *   -- Katana (target "katama", no metadata)
      *       -- KatanaHandler (target "blade", no metadata)
      *       -- KatanaBlade (target "blade", no metadata)
      *   -- Shuriken (target "shuriken", no metadata)
      */
      let ninjaRequest = new Request(ninjaId, context, null, ninjaBinding, null);
      let plan = new Plan(context, ninjaRequest);
      let katanaRequest = plan.rootRequest.addChildRequest(katanaId, katanaBinding, new Target("katana", katanaId));
      katanaRequest.addChildRequest(katanaHandlerId, katanaHandlerBinding, new Target("handler", katanaHandlerId));
      katanaRequest.addChildRequest(katanaBladeId, katanaBladeBinding, new Target("blade", katanaBladeId));
      plan.rootRequest.addChildRequest(shurikenId, shurikenBinding, new Target("shuriken", shurikenId));
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should store singleton type bindings in cache", () => {

      interface IKatanaBlade {}

      @injectable()
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}

      @injectable()
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      @injectable()
      class Katana implements IKatana {
          public handler: IKatanaHandler;
          public blade: IKatanaBlade;
          public constructor(
              @inject("IKatanaHandler") @targetName("handler") handler: IKatanaHandler,
              @inject("IKatanaBlade") @targetName("blade") blade: IKatanaBlade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface IShuriken {}

      @injectable()
      class Shuriken implements IShuriken {}

      interface INinja {
          katana: IKatana;
          shuriken: IShuriken;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(
              @inject("IKatana") @targetName("katana") katana: IKatana,
              @inject("IShuriken") @targetName("shuriken") shuriken: IShuriken
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      let ninjaId = "INinja";
      let shurikenId = "IShuriken";
      let katanaId = "IKatana";
      let katanaHandlerId = "IKatanaHandler";
      let katanaBladeId = "IKatanaBlade";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);
      kernel.bind<IKatana>(katanaId).to(Katana).inSingletonScope(); // SINGLETON!
      kernel.bind<IKatanaBlade>(katanaBladeId).to(KatanaBlade);
      kernel.bind<IKatanaHandler>(katanaHandlerId).to(KatanaHandler).inSingletonScope(); // SINGLETON!

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let katanaBinding = _kernel._bindingDictionary.get(katanaId)[0];
      let katanaHandlerBinding = _kernel._bindingDictionary.get(katanaHandlerId)[0];
      let katanaBladeBinding = _kernel._bindingDictionary.get(katanaBladeId)[0];
      let shurikenBinding = _kernel._bindingDictionary.get(shurikenId)[0];

      let planner = new Planner();
      let context = planner.createContext(kernel);

      /*
      *  Plan (request tree):
      *
      *  Ninja (target "null", no metadata)
      *   -- Katana (target "katama", no metadata)
      *       -- KatanaHandler (target "blade", no metadata)
      *       -- KatanaBlade (target "blade", no metadata)
      *   -- Shuriken (target "shuriken", no metadata)
      */
      let ninjaRequest = new Request(ninjaId, context, null, ninjaBinding, null);
      let plan = new Plan(context, ninjaRequest);
      let katanaRequest = plan.rootRequest.addChildRequest(katanaId, katanaBinding, new Target("katana", katanaId));
      katanaRequest.addChildRequest(katanaHandlerId, katanaHandlerBinding, new Target("handler", katanaHandlerId));
      katanaRequest.addChildRequest(katanaBladeId, katanaBladeBinding, new Target("blade", katanaBladeId));
      plan.rootRequest.addChildRequest(shurikenId, shurikenBinding, new Target("shuriken", shurikenId));
      context.addPlan(plan);

      let resolver = new Resolver();
      let createInstanceSpy = sandbox.spy(resolver, "_createInstance");

      expect(_kernel._bindingDictionary.get("IKatana")[0].cache === null).eql(true);

      expect(createInstanceSpy.callCount).eql(0);
      let ninja = resolver.resolve<INinja>(context);
      expect(ninja instanceof Ninja).eql(true);
      expect(createInstanceSpy.callCount).eql(2);
      expect(createInstanceSpy.getCall(0).args[0].name === "Katana").eql(true);
      expect(createInstanceSpy.getCall(1).args[0].name === "Ninja").eql(true);

      let ninja2 = resolver.resolve<INinja>(context);
      expect(ninja2 instanceof Ninja).eql(true);
      expect(createInstanceSpy.callCount).eql(3);
      expect(createInstanceSpy.getCall(1).args[0].name === "Ninja").eql(true);

      expect(_kernel._bindingDictionary.get("IKatana")[0].cache instanceof Katana).eql(true);

  });

  it("Should throw when an invalid BindingType is detected", () => {

      interface IKatana {}

      @injectable()
      class Katana implements IKatana {}

      interface IShuriken {}

      @injectable()
      class Shuriken implements IShuriken {}

      interface INinja {
          katana: IKatana;
          shuriken: IShuriken;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(
              @inject("IKatana") @targetName("katana") katana: IKatana,
              @inject("IShuriken") @targetName("shuriken") shuriken: IShuriken
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      // kernel and bindings
      let ninjaId = "INinja";
      let kernel = new Kernel();
      let _kernel: any = kernel;
      kernel.bind<INinja>(ninjaId); // IMPORTAN! (Invalid binding)
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];

      // context and plan
      let planner = new Planner();
      let context = planner.createContext(kernel);
      let ninjaRequest = new Request(ninjaId, context, null, ninjaBinding, null);
      let plan = new Plan(context, ninjaRequest);
      context.addPlan(plan);

      // resolver
      let resolver = new Resolver();
      let _resolver: any = resolver;
      let _resolve = _resolver._resolve;

      let throwFunction = () => {
          _resolve(ninjaRequest);
      };

      expect(ninjaRequest.bindings[0].type).eql(BindingType.Invalid);
      expect(throwFunction).to.throw(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${ninjaId}`);

  });

  it("Should be able to resolve BindingType.ConstantValue bindings", () => {

      interface IKatanaBlade {}

      @injectable()
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}

      @injectable()
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      class Katana implements IKatana {
          public handler: IKatanaHandler;
          public blade: IKatanaBlade;
          public constructor(handler: IKatanaHandler, blade: IKatanaBlade) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface IShuriken {}
      class Shuriken implements IShuriken {}

      interface INinja {
          katana: IKatana;
          shuriken: IShuriken;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(
              @inject("IKatana") @targetName("katana") katana: IKatana,
              @inject("IShuriken") @targetName("shuriken") shuriken: IShuriken
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      let ninjaId = "INinja";
      let shurikenId = "IShuriken";
      let katanaId = "IKatana";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);
      kernel.bind<IKatana>(katanaId).toConstantValue(new Katana(new KatanaHandler(), new KatanaBlade())); // IMPORTANT!

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let katanaBinding = _kernel._bindingDictionary.get(katanaId)[0];
      let shurikenBinding = _kernel._bindingDictionary.get(shurikenId)[0];

      let planner = new Planner();
      let context = planner.createContext(kernel);

      /*
      *  Plan (request tree):
      *
      *  Ninja (target "null", no metadata)
      *   -- Katana (target "katama", no metadata)
      *   -- Shuriken (target "shuriken", no metadata)
      */
      let ninjaRequest = new Request(ninjaId, context, null, ninjaBinding, null);
      let plan = new Plan(context, ninjaRequest);
      plan.rootRequest.addChildRequest(katanaId, katanaBinding, new Target("katana", katanaId));
      plan.rootRequest.addChildRequest(shurikenId, shurikenBinding, new Target("shuriken", shurikenId));
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve BindingType.DynamicValue bindings", () => {

    interface IUseDate {
        doSomething(): Date;
    }

    @injectable()
    class UseDate implements IUseDate {
        public currentDate: Date;
        public constructor(@inject("Date") currentDate: Date) {
            this.currentDate = currentDate;
        }
        public doSomething() {
            return this.currentDate;
        }
    }

    let kernel = new Kernel();
    kernel.bind<IUseDate>("IUseDate").to(UseDate);
    kernel.bind<Date>("Date").toDynamicValue(() => { return new Date(); });

    let subject1 = kernel.get<IUseDate>("IUseDate");
    let subject2 = kernel.get<IUseDate>("IUseDate");
    expect(subject1.doSomething() === subject2.doSomething()).eql(false);

    kernel.unbind("Date");
    kernel.bind<Date>("Date").toConstantValue(new Date());

    let subject3 = kernel.get<IUseDate>("IUseDate");
    let subject4 = kernel.get<IUseDate>("IUseDate");
    expect(subject3.doSomething() === subject4.doSomething()).eql(true);

  });

  it("Should be able to resolve BindingType.Constructor bindings", () => {

      interface IKatanaBlade {}

      @injectable()
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}

      @injectable()
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      @injectable()
      class Katana implements IKatana {
          public handler: IKatanaHandler;
          public blade: IKatanaBlade;
          public constructor(
              @inject("IKatanaHandler") @targetName("handler") handler: IKatanaHandler,
              @inject("IKatanaBlade") @targetName("blade") blade: IKatanaBlade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface IShuriken {}
      class Shuriken implements IShuriken {}

      interface INinja {
          katana: IKatana;
          shuriken: IShuriken;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(
              @inject("IKatana") @targetName("katana") katana: IKatana,
              @inject("IShuriken") @targetName("shuriken") shuriken: IShuriken
          ) {
              this.katana = new Katana(new KatanaHandler(), new KatanaBlade());  // IMPORTANT!
              this.shuriken = shuriken;
          }
      }

      let ninjaId = "INinja";
      let shurikenId = "IShuriken";
      let newableKatanaId = "INewable<IKatana>";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);
      kernel.bind<INewable<IKatana>>(newableKatanaId).toConstructor<IKatana>(Katana);  // IMPORTANT!

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let newableKatanaBinding = _kernel._bindingDictionary.get(newableKatanaId)[0];
      let shurikenBinding = _kernel._bindingDictionary.get(shurikenId)[0];

      let planner = new Planner();
      let context = planner.createContext(kernel);

      let ninjaRequest = new Request(ninjaId, context, null, ninjaBinding, null);
      let plan = new Plan(context, ninjaRequest);
      plan.rootRequest.addChildRequest(newableKatanaId, newableKatanaBinding, new Target("Katana", newableKatanaId));
      plan.rootRequest.addChildRequest(shurikenId, shurikenBinding, new Target("shuriken", shurikenId));
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve BindingType.Factory bindings", () => {

      interface IKatanaBlade {}

      @injectable()
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}

      @injectable()
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      interface IKatanaFactory extends Function {
          (): IKatana;
      }

      @injectable()
      class Katana implements IKatana {
          public handler: IKatanaHandler;
          public blade: IKatanaBlade;
          public constructor(
              @inject("IKatanaHandler") @targetName("handler") handler: IKatanaHandler,
              @inject("IKatanaBlade") @targetName("blade") blade: IKatanaBlade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface IShuriken {}

      @injectable()
      class Shuriken implements IShuriken {}

      interface INinja {
          katana: IKatana;
          shuriken: IShuriken;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(
              @inject("IKatanaFactory") @targetName("makeKatana") makeKatana: IKatanaFactory,
              @inject("IShuriken") @targetName("shuriken") shuriken: IShuriken
          ) {
              this.katana = makeKatana(); // IMPORTANT!
              this.shuriken = shuriken;
          }
      }

      let ninjaId = "INinja";
      let shurikenId = "IShuriken";
      let katanaFactoryId = "IFactory<IKatana>";
      let katanaId = "IKatana";
      let katanaHandlerId = "IKatanaHandler";
      let katanaBladeId = "IKatanaBlade";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);
      kernel.bind<IKatana>(katanaId).to(Katana);
      kernel.bind<IKatanaBlade>(katanaBladeId).to(KatanaBlade);
      kernel.bind<IKatanaHandler>(katanaHandlerId).to(KatanaHandler);

      kernel.bind<IFactory<IKatana>>(katanaFactoryId).toFactory<IKatana>((context: IContext) => {
          return () => {
              return context.kernel.get<IKatana>(katanaId);
          };
      });

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let katanaFactoryBinding = _kernel._bindingDictionary.get(katanaFactoryId)[0];
      let shurikenBinding = _kernel._bindingDictionary.get(shurikenId)[0];

      let planner = new Planner();
      let context = planner.createContext(kernel);

      let ninjaRequest = new Request(ninjaId, context, null, ninjaBinding, null);
      let plan = new Plan(context, ninjaRequest);
      plan.rootRequest.addChildRequest(katanaFactoryId, katanaFactoryBinding, new Target("makeKatana", katanaFactoryId));
      plan.rootRequest.addChildRequest(shurikenId, shurikenBinding, new Target("shuriken", shurikenId));
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve bindings with auto factory", () => {

      interface IKatanaBlade {}

      @injectable()
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}

      @injectable()
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      interface IKatanaFactory extends Function {
          (): IKatana;
      }

      @injectable()
      class Katana implements IKatana {
          public handler: IKatanaHandler;
          public blade: IKatanaBlade;
          public constructor(
              @inject("IKatanaHandler") @targetName("handler") handler: IKatanaHandler,
              @inject("IKatanaBlade") @targetName("blade") blade: IKatanaBlade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface IShuriken {}

      @injectable()
      class Shuriken implements IShuriken {}

      interface INinja {
          katana: IKatana;
          shuriken: IShuriken;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(
              @inject("IKatanaFactory") @targetName("makeKatana") makeKatana: IKatanaFactory,
              @inject("IShuriken") @targetName("shuriken") shuriken: IShuriken
          ) {
              this.katana = makeKatana(); // IMPORTANT!
              this.shuriken = shuriken;
          }
      }

      let ninjaId = "INinja";
      let shurikenId = "IShuriken";
      let katanaFactoryId = "IFactory<IKatana>";
      let katanaId = "IKatana";
      let katanaHandlerId = "IKatanaHandler";
      let katanaBladeId = "IKatanaBlade";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);
      kernel.bind<IKatana>(katanaId).to(Katana);
      kernel.bind<IKatanaBlade>(katanaBladeId).to(KatanaBlade);
      kernel.bind<IKatanaHandler>(katanaHandlerId).to(KatanaHandler);

      kernel.bind<IFactory<IKatana>>(katanaFactoryId).toAutoFactory<IKatana>(katanaId);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let katanaFactoryBinding = _kernel._bindingDictionary.get(katanaFactoryId)[0];
      let shurikenBinding = _kernel._bindingDictionary.get(shurikenId)[0];

      let planner = new Planner();
      let context = planner.createContext(kernel);

      let ninjaRequest = new Request(ninjaId, context, null, ninjaBinding, null);
      let plan = new Plan(context, ninjaRequest);
      plan.rootRequest.addChildRequest(katanaFactoryId, katanaFactoryBinding, new Target("makeKatana", katanaFactoryId));
      plan.rootRequest.addChildRequest(shurikenId, shurikenBinding, new Target("shuriken", shurikenId));
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.katana.handler instanceof KatanaHandler).eql(true);
      expect(ninja.katana.blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve BindingType.Provider bindings", (done) => {

      interface IKatanaBlade {}

      @injectable()
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}

      @injectable()
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      interface IKatanaFactory extends Function {
          (): IKatana;
      }

      @injectable()
      class Katana implements IKatana {
          public handler: IKatanaHandler;
          public blade: IKatanaBlade;
          public constructor(
              @inject("IKatanaHandler") @targetName("handler") handler: IKatanaHandler,
              @inject("IKatanaBlade") @targetName("handler") blade: IKatanaBlade
          ) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface IShuriken {}

      @injectable()
      class Shuriken implements IShuriken {}

      interface INinja {
          katana: IKatana;
          katanaProvider: IProvider<IKatana>;
          shuriken: IShuriken;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IKatana;
          public katanaProvider: IProvider<IKatana>;
          public shuriken: IShuriken;
          public constructor(
              @inject("IProvider<IKatana>") @targetName("katanaProvider") katanaProvider: IProvider<IKatana>,
              @inject("IShuriken") @targetName("shuriken") shuriken: IShuriken
          ) {
              this.katana = null;
              this.katanaProvider = katanaProvider;
              this.shuriken = shuriken;
          }
      }

      let ninjaId = "INinja";
      let shurikenId = "IShuriken";
      let katanaProviderId = "IProvider<IKatana>";
      let katanaId = "IKatana";
      let katanaHandlerId = "IKatanaHandler";
      let katanaBladeId = "IKatanaBlade";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);
      kernel.bind<IKatana>(katanaId).to(Katana);
      kernel.bind<IKatanaBlade>(katanaBladeId).to(KatanaBlade);
      kernel.bind<IKatanaHandler>(katanaHandlerId).to(KatanaHandler);

      kernel.bind<IProvider<IKatana>>(katanaProviderId).toProvider<IKatana>((context: IContext) => {
          return () => {
              return new Promise<IKatana>((resolve) => {
                  // Using setTimeout to simulate complex initialization
                  setTimeout(() => { resolve(context.kernel.get<IKatana>(katanaId)); }, 100);
              });
          };
      });

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let katanaFactoryBinding = _kernel._bindingDictionary.get(katanaProviderId)[0];
      let shurikenBinding = _kernel._bindingDictionary.get(shurikenId)[0];

      let planner = new Planner();
      let context = planner.createContext(kernel);

      let ninjaRequest = new Request(ninjaId, context, null, ninjaBinding, null);
      let plan = new Plan(context, ninjaRequest);
      plan.rootRequest.addChildRequest(katanaProviderId, katanaFactoryBinding, new Target("katanaProvider", katanaProviderId));
      plan.rootRequest.addChildRequest(shurikenId, shurikenBinding, new Target("shuriken", shurikenId));
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

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

      interface IWeapon {}

      @injectable()
      class Katana implements IWeapon { }

      @injectable()
      class Shuriken implements IWeapon {}

      interface INinja {
          katana: IWeapon;
          shuriken: IWeapon;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IWeapon;
          public shuriken: IWeapon;
          public constructor(
              @inject("IWeapon") @targetName("katana") @tagged("canThrow", false) katana: IWeapon,
              @inject("IWeapon") @targetName("shuriken") @tagged("canThrow", true) shuriken: IWeapon
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      let ninjaId = "INinja";
      let weaponId = "IWeapon";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IWeapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
      kernel.bind<IWeapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);
      let plan = planner.createPlan(context, ninjaBinding, null);
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve plans with constraints on named targets", () => {

      interface IWeapon {}

      @injectable()
      class Katana implements IWeapon {}

      @injectable()
      class Shuriken implements IWeapon {}

      interface INinja {
          katana: IWeapon;
          shuriken: IWeapon;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IWeapon;
          public shuriken: IWeapon;
          public constructor(
              @inject("IWeapon") @targetName("katana") @named("strong")katana: IWeapon,
              @inject("IWeapon") @targetName("shuriken") @named("weak") shuriken: IWeapon
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      let ninjaId = "INinja";
      let weaponId = "IWeapon";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IWeapon>(weaponId).to(Katana).whenTargetNamed("strong");
      kernel.bind<IWeapon>(weaponId).to(Shuriken).whenTargetNamed("weak");

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);
      let plan = planner.createPlan(context, ninjaBinding, null);
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve plans with custom contextual constraints", () => {

      interface IWeapon {}

      @injectable()
      class Katana implements IWeapon {}

      @injectable()
      class Shuriken implements IWeapon {}

      interface INinja {
          katana: IWeapon;
          shuriken: IWeapon;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IWeapon;
          public shuriken: IWeapon;
          public constructor(
              @inject("IWeapon") @targetName("katana") katana: IWeapon,
              @inject("IWeapon") @targetName("shuriken") shuriken: IWeapon
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      let ninjaId = "INinja";
      let weaponId = "IWeapon";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);

      kernel.bind<IWeapon>(weaponId).to(Katana).when((request: IRequest) => {
          return request.target.name.equals("katana");
      });

      kernel.bind<IWeapon>(weaponId).to(Shuriken).when((request: IRequest) => {
          return request.target.name.equals("shuriken");
      });

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);
      let plan = planner.createPlan(context, ninjaBinding, null);
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);
  });

  it("Should be able to resolve plans with multi-injections", () => {

      interface IWeapon {
          name: string;
      }

      @injectable()
      class Katana implements IWeapon {
          public name = "Katana";
      }

      @injectable()
      class Shuriken implements IWeapon {
          public name = "Shuriken";
      }

      interface INinja {
          katana: IWeapon;
          shuriken: IWeapon;
      }

      @injectable()
      class Ninja implements INinja {
          public katana: IWeapon;
          public shuriken: IWeapon;
          public constructor(
              @multiInject("IWeapon") @targetName("weapons") weapons: IWeapon[]
          ) {
              this.katana = weapons[0];
              this.shuriken = weapons[1];
          }
      }

      let ninjaId = "INinja";
      let weaponId = "IWeapon";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IWeapon>(weaponId).to(Katana);
      kernel.bind<IWeapon>(weaponId).to(Shuriken);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);
      let plan = planner.createPlan(context, ninjaBinding, null);
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

      // if only one value is bound to weaponId
      let kernel2 = new Kernel();
      kernel2.bind<INinja>(ninjaId).to(Ninja);
      kernel2.bind<IWeapon>(weaponId).to(Katana);

      let _kernel2: any = kernel2;
      let ninjaBinding2 = _kernel2._bindingDictionary.get(ninjaId)[0];
      let planner2 = new Planner();
      let context2 = planner2.createContext(kernel2);
      let plan2 = planner2.createPlan(context2, ninjaBinding2, null);
      context2.addPlan(plan2);

      let resolver2 = new Resolver();
      let ninja2 = resolver2.resolve<INinja>(context2);

      expect(ninja2 instanceof Ninja).eql(true);
      expect(ninja2.katana instanceof Katana).eql(true);

  });

  it("Should be able to resolve plans with activation handlers", () => {

        interface IKatana {
            use: () => void;
        }

        @injectable()
        class Katana implements IKatana {
            public use() {
                return "Used Katana!";
            }
        }

        interface INinja {
            katana: IKatana;
        }

        @injectable()
        class Ninja implements INinja {
            public katana: IKatana;
            public constructor(
                @inject("IKatana") katana: IKatana
            ) {
                this.katana = katana;
            }
        }

        let ninjaId = "INinja";
        let katanaId = "IKatana";

        let kernel = new Kernel();
        kernel.bind<INinja>(ninjaId).to(Ninja);

        // This is a global for unit testing but remember
        // that it is not a good idea to use globals
        let timeTracker: string[] = [];

        kernel.bind<IKatana>(katanaId).to(Katana).onActivation((context: IContext, katana: IKatana) => {
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

        let _kernel: any = kernel;
        let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
        let planner = new Planner();
        let context = planner.createContext(kernel);
        let plan = planner.createPlan(context, ninjaBinding, null);
        context.addPlan(plan);

        let resolver = new Resolver();
        let ninja = resolver.resolve<INinja>(context);

        expect(ninja.katana.use()).eql("Used Katana!");
        expect(Array.isArray(timeTracker)).eql(true);
        expect(timeTracker.length).eql(2);

  });

  it("Should be able to resolve BindingType.Function bindings", () => {

      let ninjaId = "INinja";
      let shurikenId = "IShuriken";
      let katanaFactoryId = "KatanaFactory";

      interface KatanaFactory extends Function {
          (): IKatana;
      }

      interface IKatanaBlade {}

      @injectable()
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}

      @injectable()
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      class Katana implements IKatana {
          public handler: IKatanaHandler;
          public blade: IKatanaBlade;
          public constructor(handler: IKatanaHandler, blade: IKatanaBlade) {
              this.handler = handler;
              this.blade = blade;
          }
      }

      interface IShuriken {}
      class Shuriken implements IShuriken {}

      interface INinja {
          katanaFactory: KatanaFactory;
          shuriken: IShuriken;
      }

      @injectable()
      class Ninja implements INinja {
          public katanaFactory: KatanaFactory;
          public shuriken: IShuriken;
          public constructor(
              @inject(katanaFactoryId) @targetName("katana") katanaFactory: KatanaFactory,
              @inject(shurikenId) @targetName("shuriken") shuriken: IShuriken
          ) {
              this.katanaFactory = katanaFactory;
              this.shuriken = shuriken;
          }
      }

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);

      let katanaFactory = function() {
          return new Katana(new KatanaHandler(), new KatanaBlade());
      };

      kernel.bind<KatanaFactory>(katanaFactoryId).toFunction(katanaFactory); // IMPORTANT!

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let katanaBinding = _kernel._bindingDictionary.get(katanaFactoryId)[0];
      let shurikenBinding = _kernel._bindingDictionary.get(shurikenId)[0];

      let planner = new Planner();
      let context = planner.createContext(kernel);

      /*
      *  Plan (request tree):
      *
      *  Ninja (target "null", no metadata)
      *   -- Katana (target "katama", no metadata)
      *   -- Shuriken (target "shuriken", no metadata)
      */
      let ninjaRequest = new Request(ninjaId, context, null, ninjaBinding, null);
      let plan = new Plan(context, ninjaRequest);
      plan.rootRequest.addChildRequest(katanaFactoryId, katanaBinding, new Target("katana", katanaFactoryId));
      plan.rootRequest.addChildRequest(shurikenId, shurikenBinding, new Target("shuriken", shurikenId));
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(typeof ninja.katanaFactory === "function").eql(true);
      expect(ninja.katanaFactory() instanceof Katana).eql(true);
      expect(ninja.katanaFactory().handler instanceof KatanaHandler).eql(true);
      expect(ninja.katanaFactory().blade instanceof KatanaBlade).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

});
