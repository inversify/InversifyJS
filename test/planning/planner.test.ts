///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import * as sinon from "sinon";
import Planner from "../../src/planning/planner";
import Context from "../../src/planning/context";
import Kernel from "../../src/kernel/kernel";
import Request from "../../src/planning/request";
import Plan from "../../src/planning/plan";
import Target from "../../src/planning/target";
import inject from "../../src/annotation/inject";
import paramNames from "../../src/annotation/paramnames";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import tagged from "../../src/annotation/tagged";

describe("Planner", () => {

  let sandbox: Sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Should be able to create instances of Context", () => {

      let kernel = new Kernel();
      let planner = new Planner();
      let context = planner.createContext(kernel);

      expect(context instanceof Context).eql(true);
      expect(context.kernel instanceof Kernel).eql(true);

  });

  it("Should be able to create a basic plan", () => {

      interface IKatanaBlade {}
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {}

      @inject("IKatanaHandler", "IKatanaBlade")
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

      interface INinja {}

      @inject("IKatana", "IShuriken")
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

      let planner = new Planner();
      let context = planner.createContext(kernel);

      /* 
      *  Expected Plan (request tree):
      *  
      *  Ninja (target "null", no metadata)
      *   -- Katana (target "katama", no metadata)
      *       -- KatanaHandler (target "blade", no metadata)
      *       -- KatanaBlade (target "blade", no metadata)
      *   -- Shuriken (target "shuriken", no metadata)
      */
      let ninjaRequest = new Request(ninjaId, context, null, null, null);
      let expectedPlan = new Plan(context, ninjaRequest);
      let katanaRequest = expectedPlan.rootRequest.addChildRequest(katanaId, null, new Target("katana", katanaId));
      let katanaHandlerRequest = katanaRequest.addChildRequest(katanaHandlerId, null, new Target("handler", katanaHandlerId));
      let katanaBladeRequest = katanaRequest.addChildRequest(katanaBladeId, null, new Target("blade", katanaBladeId));
      let shurikenRequest = expectedPlan.rootRequest.addChildRequest(shurikenId, null, new Target("shuriken", shurikenId));

      // Actual
      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let actualPlan = planner.createPlan(context, ninjaBinding);
      let actualNinjaRequest = actualPlan.rootRequest;
      let actualKatanaRequest = actualNinjaRequest.childRequests[0];
      let actualKatanaHandlerRequest = actualKatanaRequest.childRequests[0];
      let actualKatanaBladeRequest = actualKatanaRequest.childRequests[1];
      let actualShurikenRequest = actualNinjaRequest.childRequests[1];

      expect(actualNinjaRequest.service)
        .eql(ninjaRequest.service);

      expect(actualNinjaRequest.target)
        .eql(ninjaRequest.target);

      expect(actualNinjaRequest.childRequests.length)
        .eql(ninjaRequest.childRequests.length);

      // IKatana

      expect(actualKatanaRequest.service)
        .eql(katanaRequest.service);

      expect((<any>actualKatanaRequest.bindings[0].implementationType).name)
        .eql((<any>Katana).name);

      expect(actualKatanaRequest.bindings.length).eql(1);

      expect(actualKatanaRequest.target.service.value())
        .eql(katanaRequest.target.service.value());

      expect(actualKatanaRequest.childRequests.length)
        .eql(katanaRequest.childRequests.length);

      // IKatanaHandler

      expect(actualKatanaHandlerRequest.service)
        .eql(katanaHandlerRequest.service);

      expect((<any>actualKatanaHandlerRequest.bindings[0].implementationType).name)
        .eql((<any>KatanaHandler).name);

      expect(actualKatanaHandlerRequest.bindings.length).eql(1);

      expect(actualKatanaHandlerRequest.target.service.value())
        .eql(katanaHandlerRequest.target.service.value());

      // IKatanaBalde

      expect(actualKatanaBladeRequest.service)
        .eql(katanaBladeRequest.service);

      expect((<any>actualKatanaBladeRequest.bindings[0].implementationType).name)
        .eql((<any>KatanaBlade).name);

      expect(actualKatanaBladeRequest.bindings.length).eql(1);

      expect(actualKatanaBladeRequest.target.service.value())
        .eql(katanaBladeRequest.target.service.value());

      // IShuriken

      expect(actualShurikenRequest.service)
        .eql(shurikenRequest.service);

      expect((<any>actualShurikenRequest.bindings[0].implementationType).name)
        .eql((<any>Shuriken).name);

      expect(actualShurikenRequest.bindings.length).eql(1);

      expect(actualShurikenRequest.target.service.value())
        .eql(shurikenRequest.target.service.value());

  });

  it("Should throw when circular dependencies found", () => {

      interface IA {}
      interface IB {}
      interface IC {}
      interface ID {}

      @inject("IA")
      class D implements IC {
          public a: IA;
          public constructor(a: IA) { // circular dependency
              this.a = a;
          }
      }

      @inject("ID")
      class C implements IC {
          public d: ID;
          public constructor(d: ID) {
              this.d = d;
          }
      }

      class B implements IB {}

      @inject("IB", "IC")
      class A implements IA {
          public b: IB;
          public c: IC;
          public constructor(b: IB, c: IC) {
              this.b = b;
              this.c = c;
          }
      }

      let aId = "IA";
      let bId = "IB";
      let cId = "IC";
      let dId = "ID";

      let kernel = new Kernel();
      kernel.bind<IA>(aId).to(A);
      kernel.bind<IB>(bId).to(B);
      kernel.bind<IC>(cId).to(C);
      kernel.bind<ID>(dId).to(D);

      let throwErroFunction = () => {
          kernel.get(aId);
      };

      expect(throwErroFunction).to.throw(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} ${aId} and ${dId}`);

  });

  it("Should only plan sub-dependencies when binding type is BindingType.Instance", () => {

      interface IKatanaBlade {}
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {}

      @inject("IKatanaHandler", "IKatanaBlade")
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

      interface INinja {}

      @inject("IFactory<IKatana>", "IShuriken")
      @paramNames("katanaFactory", "shuriken")
      class Ninja implements INinja {
          public katanaFactory: IFactory<IKatana>;
          public shuriken: IShuriken;
          public constructor(katanaFactory: IFactory<IKatana>, shuriken: IShuriken) {
              this.katanaFactory = katanaFactory;
              this.shuriken = shuriken;
          }
      }

      let ninjaId = "INinja";
      let shurikenId = "IShuriken";
      let katanaId = "IKatana";
      let katanaHandlerId = "IKatanaHandler";
      let katanaBladeId = "IKatanaBlade";
      let katanaFactoryId = "IFactory<IKatana>";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);
      kernel.bind<IKatana>(katanaBladeId).to(Katana);
      kernel.bind<IKatanaBlade>(katanaBladeId).to(KatanaBlade);
      kernel.bind<IKatanaHandler>(katanaHandlerId).to(KatanaHandler);
      kernel.bind<IFactory<IKatana>>(katanaFactoryId).toFactory<IKatana>((context) => {
          return () => {
              return context.kernel.get<IKatana>(katanaId);
          };
      });

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);
      let actualPlan = planner.createPlan(context, ninjaBinding);

      expect(actualPlan.rootRequest.service).eql(ninjaId);
      expect(actualPlan.rootRequest.childRequests[0].service).eql(katanaFactoryId);
      expect(actualPlan.rootRequest.childRequests[0].childRequests.length).eql(0); // IMPORTANT!
      expect(actualPlan.rootRequest.childRequests[1].service).eql(shurikenId);
      expect(actualPlan.rootRequest.childRequests[1].childRequests.length).eql(0);
      expect(actualPlan.rootRequest.childRequests[2]).eql(undefined);

  });

  it("Should generate plans with multi-injections", () => {

      interface IWeapon {}

      class Katana implements IWeapon {}
      class Shuriken implements IWeapon {}

      interface INinja {}

      @inject("IWeapon[]")
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
      kernel.bind<IWeapon>(weaponId).to(Shuriken);
      kernel.bind<IWeapon>(weaponId).to(Katana);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);
      let actualPlan = planner.createPlan(context, ninjaBinding);

      // root request has no target
      expect(actualPlan.rootRequest.service).eql(ninjaId);
      expect(actualPlan.rootRequest.target).eql(null);

      // root request should only have one child request with target weapons/IWeapon[]
      expect(actualPlan.rootRequest.childRequests[0].service).eql("IWeapon[]");
      expect(actualPlan.rootRequest.childRequests[1]).eql(undefined);
      expect(actualPlan.rootRequest.childRequests[0].target.name.value()).eql("weapons");
      expect(actualPlan.rootRequest.childRequests[0].target.service.value()).eql("IWeapon[]");

      // child request should have to child requests with targets weapons/IWeapon[] but bindings Katana and Shuriken
      expect(actualPlan.rootRequest.childRequests[0].childRequests.length).eql(2);

      expect(actualPlan.rootRequest.childRequests[0].childRequests[0].service).eql(weaponId);
      expect(actualPlan.rootRequest.childRequests[0].childRequests[0].target.name.value()).eql("weapons");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[0].target.service.value()).eql("IWeapon[]");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[0].service).eql("IWeapon");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[0].bindings[0].runtimeIdentifier).eql("IWeapon");
      let shurikenImplementationType: any = actualPlan.rootRequest.childRequests[0].childRequests[0].bindings[0].implementationType;
      expect(shurikenImplementationType.name).eql("Shuriken");

      expect(actualPlan.rootRequest.childRequests[0].childRequests[1].service).eql(weaponId);
      expect(actualPlan.rootRequest.childRequests[0].childRequests[1].target.name.value()).eql("weapons");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[1].target.service.value()).eql("IWeapon[]");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[1].service).eql("IWeapon");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[1].bindings[0].runtimeIdentifier).eql("IWeapon");
      let katanaImplementationType: any = actualPlan.rootRequest.childRequests[0].childRequests[1].bindings[0].implementationType;
      expect(katanaImplementationType.name).eql("Katana");

  });

  it("Should throw when an not matching bindings are found", () => {

      interface IKatana {}
      class Katana implements IKatana { }

      interface IShuriken {}
      class Shuriken implements IShuriken {}

      interface INinja {}

      @inject("IKatana", "IShuriken")
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

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);

      let throwFunction = () => { planner.createPlan(context, ninjaBinding); };
      expect(throwFunction).to.throw(`${ERROR_MSGS.NOT_REGISTERED} IKatana`);

  });

  it("Should throw when an ambiguous match is found", () => {

      interface IKatana {}
      class Katana implements IKatana { }
      class SharpKatana implements IKatana { }

      interface IShuriken {}
      class Shuriken implements IShuriken {}

      interface INinja {}

      @inject("IKatana", "IShuriken")
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
      let katanaId = "IKatana";
      let shurikenId = "IShuriken";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IKatana>(katanaId).to(Katana);
      kernel.bind<IKatana>(katanaId).to(SharpKatana);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);

      let throwFunction = () => { planner.createPlan(context, ninjaBinding); };
      expect(throwFunction).to.throw(`${ERROR_MSGS.AMBIGUOUS_MATCH} IKatana`);

  });

  it("Should apply constrains when an ambiguous match is found", () => {

      interface IWeapon {}
      class Katana implements IWeapon { }
      class Shuriken implements IWeapon {}

      interface INinja {}

      @inject("IWeapon", "IWeapon")
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

      let actualPlan = planner.createPlan(context, ninjaBinding);

      // root request has no target
      expect(actualPlan.rootRequest.service).eql(ninjaId);
      expect(actualPlan.rootRequest.target).eql(null);

      // root request should have 2 child requests
      expect(actualPlan.rootRequest.childRequests[0].service).eql(weaponId);
      expect(actualPlan.rootRequest.childRequests[0].target.name.value()).eql("katana");
      expect(actualPlan.rootRequest.childRequests[0].target.service.value()).eql(weaponId);

      expect(actualPlan.rootRequest.childRequests[1].service).eql(weaponId);
      expect(actualPlan.rootRequest.childRequests[1].target.name.value()).eql("shuriken");
      expect(actualPlan.rootRequest.childRequests[1].target.service.value()).eql(weaponId);

      expect(actualPlan.rootRequest.childRequests[2]).eql(undefined);

  });

});
