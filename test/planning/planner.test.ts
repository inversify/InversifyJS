///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import * as sinon from "sinon";
import Planner from "../../src/planning/planner";
import Context from "../../src/planning/context";
import Kernel from "../../src/kernel/kernel";
import Request from "../../src/planning/request";
import Plan from "../../src/planning/plan";
import Target from "../../src/planning/target";
import injectable from "../../src/annotation/injectable";
import targetName from "../../src/annotation/target_name";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import tagged from "../../src/annotation/tagged";
import inject from "../../src/annotation/inject";
import multiInject from "../../src/annotation/multi_inject";

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

      @injectable()
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}

      @injectable()
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {}

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

      interface INinja {}

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
      let actualPlan = planner.createPlan(context, ninjaBinding, null);
      let actualNinjaRequest = actualPlan.rootRequest;
      let actualKatanaRequest = actualNinjaRequest.childRequests[0];
      let actualKatanaHandlerRequest = actualKatanaRequest.childRequests[0];
      let actualKatanaBladeRequest = actualKatanaRequest.childRequests[1];
      let actualShurikenRequest = actualNinjaRequest.childRequests[1];

      expect(actualNinjaRequest.serviceIdentifier)
        .eql(ninjaRequest.serviceIdentifier);

      expect(actualNinjaRequest.target)
        .eql(ninjaRequest.target);

      expect(actualNinjaRequest.childRequests.length)
        .eql(ninjaRequest.childRequests.length);

      // IKatana

      expect(actualKatanaRequest.serviceIdentifier)
        .eql(katanaRequest.serviceIdentifier);

      expect((<any>actualKatanaRequest.bindings[0].implementationType).name)
        .eql((<any>Katana).name);

      expect(actualKatanaRequest.bindings.length).eql(1);

      expect(actualKatanaRequest.target.serviceIdentifier)
        .eql(katanaRequest.target.serviceIdentifier);

      expect(actualKatanaRequest.childRequests.length)
        .eql(katanaRequest.childRequests.length);

      // IKatanaHandler

      expect(actualKatanaHandlerRequest.serviceIdentifier)
        .eql(katanaHandlerRequest.serviceIdentifier);

      expect((<any>actualKatanaHandlerRequest.bindings[0].implementationType).name)
        .eql((<any>KatanaHandler).name);

      expect(actualKatanaHandlerRequest.bindings.length).eql(1);

      expect(actualKatanaHandlerRequest.target.serviceIdentifier)
        .eql(katanaHandlerRequest.target.serviceIdentifier);

      // IKatanaBalde

      expect(actualKatanaBladeRequest.serviceIdentifier)
        .eql(katanaBladeRequest.serviceIdentifier);

      expect((<any>actualKatanaBladeRequest.bindings[0].implementationType).name)
        .eql((<any>KatanaBlade).name);

      expect(actualKatanaBladeRequest.bindings.length).eql(1);

      expect(actualKatanaBladeRequest.target.serviceIdentifier)
        .eql(katanaBladeRequest.target.serviceIdentifier);

      // IShuriken

      expect(actualShurikenRequest.serviceIdentifier)
        .eql(shurikenRequest.serviceIdentifier);

      expect((<any>actualShurikenRequest.bindings[0].implementationType).name)
        .eql((<any>Shuriken).name);

      expect(actualShurikenRequest.bindings.length).eql(1);

      expect(actualShurikenRequest.target.serviceIdentifier)
        .eql(shurikenRequest.target.serviceIdentifier);

  });

  it("Should throw when circular dependencies found", () => {

      interface IA {}
      interface IB {}
      interface IC {}
      interface ID {}

      @injectable()
      class D implements IC {
          public a: IA;
          public constructor(
              @inject("IA") a: IA
          ) { // circular dependency
              this.a = a;
          }
      }

      @injectable()
      class C implements IC {
          public d: ID;
          public constructor(
              @inject("ID") d: ID
          ) {
              this.d = d;
          }
      }

      @injectable()
      class B implements IB {}

      @injectable()
      class A implements IA {
          public b: IB;
          public c: IC;
          public constructor(
              @inject("IB") b: IB,
              @inject("IC") c: IC
          ) {
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

      @injectable()
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}

      @injectable()
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {}

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

      interface INinja {}

      @injectable()
      class Ninja implements INinja {
          public katanaFactory: IFactory<IKatana>;
          public shuriken: IShuriken;
          public constructor(
              @inject("IFactory<IKatana>") @targetName("katanaFactory") katanaFactory: IFactory<IKatana>,
              @inject("IShuriken") @targetName("shuriken") shuriken: IShuriken
          ) {
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
      let actualPlan = planner.createPlan(context, ninjaBinding, null);

      expect(actualPlan.rootRequest.serviceIdentifier).eql(ninjaId);
      expect(actualPlan.rootRequest.childRequests[0].serviceIdentifier).eql(katanaFactoryId);
      expect(actualPlan.rootRequest.childRequests[0].childRequests.length).eql(0); // IMPORTANT!
      expect(actualPlan.rootRequest.childRequests[1].serviceIdentifier).eql(shurikenId);
      expect(actualPlan.rootRequest.childRequests[1].childRequests.length).eql(0);
      expect(actualPlan.rootRequest.childRequests[2]).eql(undefined);

  });

  it("Should generate plans with multi-injections", () => {

      interface IWeapon {}

      @injectable()
      class Katana implements IWeapon {}

      @injectable()
      class Shuriken implements IWeapon {}

      interface INinja {}

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
      kernel.bind<IWeapon>(weaponId).to(Shuriken);
      kernel.bind<IWeapon>(weaponId).to(Katana);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);
      let actualPlan = planner.createPlan(context, ninjaBinding, null);

      // root request has no target
      expect(actualPlan.rootRequest.serviceIdentifier).eql(ninjaId);
      expect(actualPlan.rootRequest.target).eql(null);

      // root request should only have one child request with target weapons/IWeapon[]
      expect(actualPlan.rootRequest.childRequests[0].serviceIdentifier).eql("IWeapon");
      expect(actualPlan.rootRequest.childRequests[1]).eql(undefined);
      expect(actualPlan.rootRequest.childRequests[0].target.name.value()).eql("weapons");
      expect(actualPlan.rootRequest.childRequests[0].target.serviceIdentifier).eql("IWeapon");
      expect(actualPlan.rootRequest.childRequests[0].target.isArray()).eql(true);

      // child request should have two child requests with targets weapons/IWeapon[] but bindings Katana and Shuriken
      expect(actualPlan.rootRequest.childRequests[0].childRequests.length).eql(2);

      expect(actualPlan.rootRequest.childRequests[0].childRequests[0].serviceIdentifier).eql(weaponId);
      expect(actualPlan.rootRequest.childRequests[0].childRequests[0].target.name.value()).eql("weapons");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[0].target.serviceIdentifier).eql("IWeapon");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[0].target.isArray()).eql(true);
      expect(actualPlan.rootRequest.childRequests[0].childRequests[0].serviceIdentifier).eql("IWeapon");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[0].bindings[0].serviceIdentifier).eql("IWeapon");
      let shurikenImplementationType: any = actualPlan.rootRequest.childRequests[0].childRequests[0].bindings[0].implementationType;
      expect(shurikenImplementationType.name).eql("Shuriken");

      expect(actualPlan.rootRequest.childRequests[0].childRequests[1].serviceIdentifier).eql(weaponId);
      expect(actualPlan.rootRequest.childRequests[0].childRequests[1].target.name.value()).eql("weapons");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[1].target.serviceIdentifier).eql("IWeapon");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[1].target.isArray()).eql(true);
      expect(actualPlan.rootRequest.childRequests[0].childRequests[1].serviceIdentifier).eql("IWeapon");
      expect(actualPlan.rootRequest.childRequests[0].childRequests[1].bindings[0].serviceIdentifier).eql("IWeapon");
      let katanaImplementationType: any = actualPlan.rootRequest.childRequests[0].childRequests[1].bindings[0].implementationType;
      expect(katanaImplementationType.name).eql("Katana");

  });

  it("Should throw when no matching bindings are found", () => {

      interface IKatana {}
      @injectable()
      class Katana implements IKatana { }

      interface IShuriken {}
      @injectable()
      class Shuriken implements IShuriken {}

      interface INinja {}

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

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IShuriken>(shurikenId).to(Shuriken);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);

      let throwFunction = () => { planner.createPlan(context, ninjaBinding, null); };
      expect(throwFunction).to.throw(`${ERROR_MSGS.NOT_REGISTERED} IKatana`);

  });

  it("Should throw when an ambiguous match is found", () => {

      interface IKatana {}

      @injectable()
      class Katana implements IKatana { }

      @injectable()
      class SharpKatana implements IKatana { }

      interface IShuriken {}
      class Shuriken implements IShuriken {}

      interface INinja {}

      @injectable()
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(
              @inject("IKatana") katana: IKatana,
              @inject("IShuriken") shuriken: IShuriken
          ) {
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

      let throwFunction = () => { planner.createPlan(context, ninjaBinding, null); };
      expect(throwFunction).to.throw(`${ERROR_MSGS.AMBIGUOUS_MATCH} IKatana`);

  });

  it("Should apply constrains when an ambiguous match is found", () => {

      interface IWeapon {}

      @injectable()
      class Katana implements IWeapon { }

      @injectable()
      class Shuriken implements IWeapon {}

      interface INinja {}

      let ninjaId = "INinja";
      let weaponId = "IWeapon";

      @injectable()
      class Ninja implements INinja {
          public katana: IWeapon;
          public shuriken: IWeapon;
          public constructor(
              @inject(weaponId) @targetName("katana") @tagged("canThrow", false) katana: IWeapon,
              @inject(weaponId) @targetName("shuriken") @tagged("canThrow", true) shuriken: IWeapon
          ) {
              this.katana = katana;
              this.shuriken = shuriken;
          }
      }

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<IWeapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
      kernel.bind<IWeapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);

      let actualPlan = planner.createPlan(context, ninjaBinding, null);

      // root request has no target
      expect(actualPlan.rootRequest.serviceIdentifier).eql(ninjaId);
      expect(actualPlan.rootRequest.target).eql(null);

      // root request should have 2 child requests
      expect(actualPlan.rootRequest.childRequests[0].serviceIdentifier).eql(weaponId);
      expect(actualPlan.rootRequest.childRequests[0].target.name.value()).eql("katana");
      expect(actualPlan.rootRequest.childRequests[0].target.serviceIdentifier).eql(weaponId);

      expect(actualPlan.rootRequest.childRequests[1].serviceIdentifier).eql(weaponId);
      expect(actualPlan.rootRequest.childRequests[1].target.name.value()).eql("shuriken");
      expect(actualPlan.rootRequest.childRequests[1].target.serviceIdentifier).eql(weaponId);

      expect(actualPlan.rootRequest.childRequests[2]).eql(undefined);

  });

  it("Should be throw when a class has a missing @injectable annotation", () => {

      interface IWeapon {}
      class Katana implements IWeapon {}

      let kernel = new Kernel();
      kernel.bind<IWeapon>("IWeapon").to(Katana);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get("IWeapon")[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);

      let throwFunction = () => {
          planner.createPlan(context, ninjaBinding, null);
      };

      expect(throwFunction).to.throw(`${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} Katana.`);

  });

  it("Should be throw when an interface has a missing @injectable annotation", () => {

      interface IKatana {}

      @injectable()
      class Katana implements IKatana { }

      interface INinja {}

      @injectable()
      class Ninja implements INinja {

          public katana: IKatana;

          public constructor(
              katana: IKatana
          ) {
              this.katana = katana;
          }
      }

      let kernel = new Kernel();
      kernel.bind<INinja>("INinja").to(Ninja);
      kernel.bind<IKatana>("IKatana").to(Katana);

      let _kernel: any = kernel;
      let ninjaBinding = _kernel._bindingDictionary.get("INinja")[0];
      let planner = new Planner();
      let context = planner.createContext(kernel);

      let throwFunction = () => {
          planner.createPlan(context, ninjaBinding, null);
      };

      expect(throwFunction).to.throw(`${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument 0 in class Ninja.`);

  });

    it("Should be throw when a function has a missing @injectable annotation", () => {

        interface IKatana {}

        @injectable()
        class Katana implements IKatana { }

        interface INinja {}

        @injectable()
        class Ninja implements INinja {

            public katana: IKatana;

            public constructor(
                katanaFactory: () => IKatana
            ) {
                this.katana = katanaFactory();
            }
        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(Ninja);
        kernel.bind<IKatana>("IKatana").to(Katana);
        kernel.bind<IKatana>("IFactory<IKatana>").to(Katana);

        let _kernel: any = kernel;
        let ninjaBinding = _kernel._bindingDictionary.get("INinja")[0];
        let planner = new Planner();
        let context = planner.createContext(kernel);

        let throwFunction = () => {
            planner.createPlan(context, ninjaBinding, null);
        };

        expect(throwFunction).to.throw(`${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument 0 in class Ninja.`);
    });

});
