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
import tagged from "../../src/annotation/tagged";
import named from "../../src/annotation/named";
import paramNames from "../../src/annotation/paramnames";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import BindingType from "../../src/bindings/binding_type";
import * as Proxy from "harmony-proxy";

describe("Resolver", () => {

  let sandbox: Sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Should be able to resolve BindingType.Instance bindings", () => {

      interface IKatanaBlade {}
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      @injectable("IKatanaHandler", "IKatanaBlade")
      @paramNames("handler", "blade")
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

      @injectable("IKatana", "IShuriken")
      @paramNames("katana", "shuriken")
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(katana: IKatana, shuriken: IShuriken) {
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
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      @injectable("IKatanaHandler", "IKatanaBlade")
      @paramNames("handler", "blade")
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

      @injectable("IKatana", "IShuriken")
      @paramNames("katana", "shuriken")
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(katana: IKatana, shuriken: IShuriken) {
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
      class Katana implements IKatana {}

      interface IShuriken {}
      class Shuriken implements IShuriken {}

      interface INinja {
          katana: IKatana;
          shuriken: IShuriken;
      }

      @injectable("IKatana", "IShuriken")
      @paramNames("katana", "shuriken")
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(katana: IKatana, shuriken: IShuriken) {
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

  it("Should be able to resolve BindingType.Value bindings", () => {

      interface IKatanaBlade {}
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}
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

      @injectable("IKatana", "IShuriken")
      @paramNames("katana", "shuriken")
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(katana: IKatana, shuriken: IShuriken) {
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
      kernel.bind<IKatana>(katanaId).toValue(new Katana(new KatanaHandler(), new KatanaBlade())); // IMPORTANT!

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

  it("Should be able to resolve BindingType.Constructor bindings", () => {

      interface IKatanaBlade {}
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      @injectable("IKatanaHandler", "IKatanaBlade")
      @paramNames("handler", "blade")
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

      @injectable("IKatana", "IShuriken")
      @paramNames("katana", "shuriken")
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(Katana: INewable<IKatana>, shuriken: IShuriken) {
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
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      interface IKatanaFactory extends Function {
          (): IKatana;
      }

      @injectable("IKatanaHandler", "IKatanaBlade")
      @paramNames("handler", "blade")
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

      @injectable("IKatana", "IShuriken")
      @paramNames("katana", "shuriken")
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(makeKatana: IKatanaFactory, shuriken: IShuriken) {
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
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      interface IKatanaFactory extends Function {
          (): IKatana;
      }

      @injectable("IKatanaHandler", "IKatanaBlade")
      @paramNames("handler", "blade")
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

      @injectable("IKatana", "IShuriken")
      @paramNames("katana", "shuriken")
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(makeKatana: IKatanaFactory, shuriken: IShuriken) {
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

      kernel.bind<IFactory<IKatana>>(katanaFactoryId).toAutoFactory<IKatana>();

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
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {
          handler: IKatanaHandler;
          blade: IKatanaBlade;
      }

      interface IKatanaFactory extends Function {
          (): IKatana;
      }

      @injectable("IKatanaHandler", "IKatanaBlade")
      @paramNames("handler", "blade")
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
          katanaProvider: IProvider<IKatana>;
          shuriken: IShuriken;
      }

      @injectable("IKatana", "IShuriken")
      @paramNames("katana", "shuriken")
      class Ninja implements INinja {
          public katana: IKatana;
          public katanaProvider: IProvider<IKatana>;
          public shuriken: IShuriken;
          public constructor(katanaProvider: IProvider<IKatana>, shuriken: IShuriken) {
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
      class Katana implements IWeapon { }
      class Shuriken implements IWeapon {}

      interface INinja {
          katana: IWeapon;
          shuriken: IWeapon;
      }

      @injectable("IWeapon", "IWeapon")
      @paramNames("katana", "shuriken")
      class Ninja implements INinja {
          public katana: IWeapon;
          public shuriken: IWeapon;
          public constructor(
              @tagged("canThrow", false) katana: IWeapon,
              @tagged("canThrow", true) shuriken: IWeapon
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
      let plan = planner.createPlan(context, ninjaBinding);
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve plans with constraints on named targets", () => {

      interface IWeapon {}
      class Katana implements IWeapon { }
      class Shuriken implements IWeapon {}

      interface INinja {
          katana: IWeapon;
          shuriken: IWeapon;
      }

      @injectable("IWeapon", "IWeapon")
      @paramNames("katana", "shuriken")
      class Ninja implements INinja {
          public katana: IWeapon;
          public shuriken: IWeapon;
          public constructor(
              @named("strong")katana: IWeapon,
              @named("weak") shuriken: IWeapon
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
      let plan = planner.createPlan(context, ninjaBinding);
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve plans with custom contextual constraints", () => {

      interface IWeapon {}
      class Katana implements IWeapon { }
      class Shuriken implements IWeapon {}

      interface INinja {
          katana: IWeapon;
          shuriken: IWeapon;
      }

      @injectable("IWeapon", "IWeapon")
      @paramNames("katana", "shuriken")
      class Ninja implements INinja {
          public katana: IWeapon;
          public shuriken: IWeapon;
          public constructor(
              katana: IWeapon,
              shuriken: IWeapon
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
      let plan = planner.createPlan(context, ninjaBinding);
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

      class Katana implements IWeapon {
          public name = "Katana";
      }
      class Shuriken implements IWeapon {
          public name = "Shuriken";
      }

      interface INinja {
          katana: IWeapon;
          shuriken: IWeapon;
      }

      @injectable("IWeapon[]")
      @paramNames("weapons")
      class Ninja implements INinja {
          public katana: IWeapon;
          public shuriken: IWeapon;
          public constructor(weapons: IWeapon[]) {
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
      let plan = planner.createPlan(context, ninjaBinding);
      context.addPlan(plan);

      let resolver = new Resolver();
      let ninja = resolver.resolve<INinja>(context);

      expect(ninja instanceof Ninja).eql(true);
      expect(ninja.katana instanceof Katana).eql(true);
      expect(ninja.shuriken instanceof Shuriken).eql(true);

  });

  it("Should be able to resolve plans with activation handlers", () => {

        interface IKatana {
            use: () => void;
        }

        class Katana implements IKatana {
            public use() {
                return "Used Katana!";
            }
        }

        interface INinja {
            katana: IKatana;
        }

        @injectable("IKatana")
        class Ninja implements INinja {
            public katana: IKatana;
            public constructor(katana: IKatana) {
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

        kernel.bind<IKatana>(katanaId).to(Katana).onActivation((katana) => {
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
        let plan = planner.createPlan(context, ninjaBinding);
        context.addPlan(plan);

        let resolver = new Resolver();
        let ninja = resolver.resolve<INinja>(context);

        expect(ninja.katana.use()).eql("Used Katana!");
        expect(Array.isArray(timeTracker)).eql(true);
        expect(timeTracker.length).eql(2);

  });

});
