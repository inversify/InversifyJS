///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import * as sinon from "sinon";
import Kernel from "../../src/kernel/kernel";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

describe("Kernel", () => {

    let sandbox: Sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("Should be able to use middleware as configuration", () => {

        function logger(next: (context: IContext) => any) {
            return (context: IContext) => {
                console.log(context);
                return next(context);
            };
        };

        let kernel = new Kernel();
        kernel.applyMiddleware(logger);
        let _kernel: any = kernel;
        expect(_kernel._middleware).not.to.eql(null);

    });

    it("Should invoke middleware", () => {

        interface INinja {}
        class Ninja implements INinja {}

        let log: string[] = [];

        function middleware1(next: (context: IContext) => any) {
            return (context: IContext) => {
                log.push(`Middleware1: ${context.plan.rootRequest.service}`);
                return next(context);
            };
        };

        function middleware2(next: (context: IContext) => any) {
            return (context: IContext) => {
                log.push(`Middleware2: ${context.plan.rootRequest.service}`);
                return next(context);
            };
        };

        let kernel = new Kernel();
        kernel.applyMiddleware(middleware1, middleware2);
        kernel.bind<INinja>("INinja").to(Ninja);

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`Middleware1: INinja`);
        expect(log[1]).eql(`Middleware2: INinja`);

    });

  it("Shoule be able to use modules as configuration", () => {

      interface INinja {}
      interface IKatana {}
      interface IShuriken {}

      class Katana implements IKatana {}
      class Shuriken implements IShuriken {}
      class Ninja implements INinja {}

      let warriors = (kernel: IKernel) => {
          kernel.bind<INinja>("INinja").to(Ninja);
      };

      let weapons = (kernel: IKernel) => {
          kernel.bind<IKatana>("IKatana").to(Katana);
          kernel.bind<IShuriken>("IShuriken").to(Shuriken);
      };

      let kernel = new Kernel();
      kernel.load(warriors, weapons);

      let _kernel: any = kernel;
      expect(_kernel._bindingDictionary._dictionary[0].key).eql("INinja");
      expect(_kernel._bindingDictionary._dictionary[1].key).eql("IKatana");
      expect(_kernel._bindingDictionary._dictionary[2].key).eql("IShuriken");

  });

  it("Should be able to store bindings", () => {

      interface INinja {}
      class Ninja implements INinja {}
      let ninjaId = "INinja";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);

      let _kernel: any = kernel;
      let runtimeIdentifier = _kernel._bindingDictionary._dictionary[0].key;
      expect(runtimeIdentifier).eql(ninjaId);

  });

  it("Should unbind a binding when requested", () => {

      interface INinja {}
      class Ninja implements INinja {}
      let ninjaId = "INinja";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);

      let _kernel: any = kernel;
      let runtimeIdentifier = _kernel._bindingDictionary._dictionary[0].key;
      expect(runtimeIdentifier).eql(ninjaId);

      kernel.unbind(ninjaId);
      let length = _kernel._bindingDictionary._dictionary.length;
      expect(length).eql(0);

  });

  it("Should throw when cannot unbind", () => {

      interface INinja {}
      class Ninja implements INinja {}

      let runtimeIdentifier = "INinja";
      let kernel = new Kernel();
      let throwFunction = () => { kernel.unbind("INinja"); };
      expect(throwFunction).to.throw(`${ERROR_MSGS.CANNOT_UNBIND} ${runtimeIdentifier}`);

  });

  it("Should unbind a binding when requested", () => {

      interface INinja {}
      class Ninja implements INinja {}
      interface ISamurai {}
      class Samurai implements ISamurai {}

      let ninjaId = "INinja";
      let samuraiId = "ISamurai";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<ISamurai>(samuraiId).to(Samurai);

      let _kernel: any = kernel;
      let dictionary = _kernel._bindingDictionary._dictionary;

      expect(dictionary.length).eql(2);
      expect(dictionary[0].key).eql(ninjaId);
      expect(dictionary[1].key).eql(samuraiId);

      kernel.unbind(ninjaId);
      dictionary = _kernel._bindingDictionary._dictionary;
      expect(dictionary.length).eql(1);

  });

  it("Should be able unbound all dependencies", () => {

      interface INinja {}
      class Ninja implements INinja {}
      interface ISamurai {}
      class Samurai implements ISamurai {}

      let ninjaId = "INinja";
      let samuraiId = "ISamurai";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<ISamurai>(samuraiId).to(Samurai);

      let _kernel: any = kernel;
      let dictionary = _kernel._bindingDictionary._dictionary;

      expect(dictionary.length).eql(2);
      expect(dictionary[0].key).eql(ninjaId);
      expect(dictionary[1].key).eql(samuraiId);

      kernel.unbindAll();
      dictionary = _kernel._bindingDictionary._dictionary;
      expect(dictionary.length).eql(0);

  });

  it("Should NOT be able to get unregistered services", () => {

      interface INinja {}
      class Ninja implements INinja {}
      let ninjaId = "INinja";

      let kernel = new Kernel();
      let throwFunction = () => { kernel.get<INinja>(ninjaId); };

      expect(throwFunction).to.throw(`${ERROR_MSGS.NOT_REGISTERED} ${ninjaId}`);
  });

  it("Should be able to get a registered and not ambiguous service", () => {

      interface INinja {
          name: string;
      }

      class Ninja implements INinja {

          public name: string;

          public constructor(name: string) {
              this.name = name;
          }
      }

      let ninjaId = "INinja";
      let ninjaName = "Ryu Hayabusa";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);

      let _kernel: any = kernel;
      let dictionary = _kernel._bindingDictionary._dictionary;

      // pre conditions
      expect(dictionary.length).eql(1);
      expect(dictionary[0].key).eql(ninjaId);
      expect(dictionary[0].value.length).eql(1);

      // mock planner and resolver
      let planner = _kernel._planner;
      let resolver = _kernel._resolver;

      let plannerCreateContextStub = sandbox.stub(planner, "createContext").returns({
          addPlan: function() { /* DO NOTHING */ }
      });

      let plannerCreatePlanStub = sandbox.stub(planner, "createPlan").returns(null);
      let resolverResolveStub =  sandbox.stub(resolver, "resolve").returns(new Ninja(ninjaName));

      let ninja = kernel.get<INinja>(ninjaId);
      expect(ninja.name).eql(ninjaName);
      expect(resolverResolveStub.calledOnce).eql(true);
      expect(plannerCreateContextStub.calledOnce).eql(true);
      expect(plannerCreatePlanStub.calledOnce).eql(true);

  });

  it("Should NOT be able to get ambiguous match", () => {

      interface IWarrior {}
      class Ninja implements IWarrior {}
      class Samurai implements IWarrior {}

      let warriorId = "IWarrior";

      let kernel = new Kernel();
      kernel.bind<IWarrior>(warriorId).to(Ninja);
      kernel.bind<IWarrior>(warriorId).to(Samurai);

      let _kernel: any = kernel;
      let dictionary = _kernel._bindingDictionary._dictionary;

      expect(dictionary.length).eql(1);
      expect(dictionary[0].key).eql(warriorId);
      expect(dictionary[0].value.length).eql(2);

      let throwFunction = () => { kernel.get<IWarrior>(warriorId); };
      expect(throwFunction).to.throw(`${ERROR_MSGS.AMBIGUOUS_MATCH} ${warriorId}`);

  });

  it("Should NOT be able to getAll of an unregistered services", () => {

      interface INinja {}
      class Ninja implements INinja {}
      let ninjaId = "INinja";

      let kernel = new Kernel();
      let throwFunction = () => { kernel.getAll<INinja>(ninjaId); };

      expect(throwFunction).to.throw(`${ERROR_MSGS.NOT_REGISTERED} ${ninjaId}`);

  });

  it("Should be able to getAll of a registered and not ambiguous service", () => {

      interface INinja {
          name: string;
      }

      class Ninja implements INinja {

          public name: string;

          public constructor(name: string) {
              this.name = name;
          }
      }

      let ninjaId = "INinja";
      let ninjaName = "Ryu Hayabusa";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);

      let _kernel: any = kernel;
      let dictionary = _kernel._bindingDictionary._dictionary;

      // pre conditions
      expect(dictionary.length).eql(1);
      expect(dictionary[0].key).eql(ninjaId);
      expect(dictionary[0].value.length).eql(1);

      // mock planner and resolver
      let planner = _kernel._planner;
      let resolver = _kernel._resolver;

      let plannerCreateContextStub = sandbox.stub(planner, "createContext").returns({
          addPlan: function() { /* DO NOTHING */ }
      });

      let plannerCreatePlanStub = sandbox.stub(planner, "createPlan").returns(null);
      let resolverResolveStub =  sandbox.stub(resolver, "resolve").returns(new Ninja(ninjaName));

      let ninjas = kernel.getAll<INinja>(ninjaId);
      expect(ninjas.length).eql(1);
      expect(ninjas[0].name).eql(ninjaName);
      expect(resolverResolveStub.calledOnce).eql(true);
      expect(plannerCreateContextStub.calledOnce).eql(true);
      expect(plannerCreatePlanStub.calledOnce).eql(true);

  });

  it("Should be able to getAll of an ambiguous service", () => {

      interface IWarrior {
          name: string;
      }

      class Ninja implements IWarrior {

          public name: string;

          public constructor(name: string) {
              this.name = name;
          }
      }

      class Samurai implements IWarrior {

          public name: string;

          public constructor(name: string) {
              this.name = name;
          }
      }

      let warriorId = "IWarrior";
      let ninjaName = "Ryu Hayabusa";
      let samuraiName = "Katsumoto";

      let kernel = new Kernel();
      kernel.bind<IWarrior>(warriorId).to(Ninja);
      kernel.bind<IWarrior>(warriorId).to(Samurai);

      let _kernel: any = kernel;
      let dictionary = _kernel._bindingDictionary._dictionary;

      // pre conditions
      expect(dictionary.length).eql(1);
      expect(dictionary[0].key).eql(warriorId);
      expect(dictionary[0].value.length).eql(2);

      // mock planner and resolver
      let planner = _kernel._planner;
      let resolver = _kernel._resolver;

      let plannerCreateContextStub = sandbox.stub(planner, "createContext").returns({
          addPlan: function() { /* DO NOTHING */ }
      });

      let plannerCreatePlanStub = sandbox.stub(planner, "createPlan").returns(null);
      let resolverResolveStub =  sandbox.stub(resolver, "resolve");

      resolverResolveStub.onCall(0).returns(new Ninja(ninjaName));
      resolverResolveStub.onCall(1).returns(new Samurai(samuraiName));

      let warriors = kernel.getAll<IWarrior>(warriorId);
      expect(warriors.length).eql(2);
      expect(warriors[0].name).eql(ninjaName);
      expect(warriors[1].name).eql(samuraiName);
      expect(resolverResolveStub.callCount).eql(2);
      expect(plannerCreateContextStub.callCount).eql(2);
      expect(plannerCreatePlanStub.callCount).eql(2);

  });

});
