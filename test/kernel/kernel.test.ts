///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import * as sinon from "sinon";
import Kernel from "../../src/kernel/kernel";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import injectable from "../../src/annotation/injectable";

describe("Kernel", () => {

    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

  it("Should be able to use modules as configuration", () => {

      interface INinja {}
      interface IKatana {}
      interface IShuriken {}

      @injectable()
      class Katana implements IKatana {}

      @injectable()
      class Shuriken implements IShuriken {}

      @injectable()
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
      expect(_kernel._bindingDictionary._dictionary[0].serviceIdentifier).eql("INinja");
      expect(_kernel._bindingDictionary._dictionary[1].serviceIdentifier).eql("IKatana");
      expect(_kernel._bindingDictionary._dictionary[2].serviceIdentifier).eql("IShuriken");

  });

  it("Should be able to store bindings", () => {

      interface INinja {}

      @injectable()
      class Ninja implements INinja {}
      let ninjaId = "INinja";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);

      let _kernel: any = kernel;
      let serviceIdentifier = _kernel._bindingDictionary._dictionary[0].serviceIdentifier;
      expect(serviceIdentifier).eql(ninjaId);

  });

  it("Should have an unique identifier", () => {

      let kernel1 = new Kernel();
      let kernel2 = new Kernel();
      expect(kernel1.guid.length).eql(36);
      expect(kernel2.guid.length).eql(36);
      expect(kernel1.guid).not.eql(kernel2.guid);

  });

  it("Should unbind a binding when requested", () => {

      interface INinja {}

      @injectable()
      class Ninja implements INinja {}
      let ninjaId = "INinja";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);

      let _kernel: any = kernel;
      let serviceIdentifier = _kernel._bindingDictionary._dictionary[0].serviceIdentifier;
      expect(serviceIdentifier).eql(ninjaId);

      kernel.unbind(ninjaId);
      let length = _kernel._bindingDictionary._dictionary.length;
      expect(length).eql(0);

  });

  it("Should throw when cannot unbind", () => {

      interface INinja {}

      @injectable()
      class Ninja implements INinja {}

      let serviceIdentifier = "INinja";
      let kernel = new Kernel();
      let throwFunction = () => { kernel.unbind("INinja"); };
      expect(throwFunction).to.throw(`${ERROR_MSGS.CANNOT_UNBIND} ${serviceIdentifier}`);

  });

  it("Should unbind a binding when requested", () => {

      interface INinja {}

      @injectable()
      class Ninja implements INinja {}
      interface ISamurai {}

      @injectable()
      class Samurai implements ISamurai {}

      let ninjaId = "INinja";
      let samuraiId = "ISamurai";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<ISamurai>(samuraiId).to(Samurai);

      let _kernel: any = kernel;
      let dictionary = _kernel._bindingDictionary._dictionary;

      expect(dictionary.length).eql(2);
      expect(dictionary[0].serviceIdentifier).eql(ninjaId);
      expect(dictionary[1].serviceIdentifier).eql(samuraiId);

      kernel.unbind(ninjaId);
      dictionary = _kernel._bindingDictionary._dictionary;
      expect(dictionary.length).eql(1);

  });

  it("Should be able unbound all dependencies", () => {

      interface INinja {}

      @injectable()
      class Ninja implements INinja {}

      interface ISamurai {}

      @injectable()
      class Samurai implements ISamurai {}

      let ninjaId = "INinja";
      let samuraiId = "ISamurai";

      let kernel = new Kernel();
      kernel.bind<INinja>(ninjaId).to(Ninja);
      kernel.bind<ISamurai>(samuraiId).to(Samurai);

      let _kernel: any = kernel;
      let dictionary = _kernel._bindingDictionary._dictionary;

      expect(dictionary.length).eql(2);
      expect(dictionary[0].serviceIdentifier).eql(ninjaId);
      expect(dictionary[1].serviceIdentifier).eql(samuraiId);

      kernel.unbindAll();
      dictionary = _kernel._bindingDictionary._dictionary;
      expect(dictionary.length).eql(0);

  });

  it("Should NOT be able to get unregistered services", () => {

      interface INinja {}

      @injectable()
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

      @injectable()
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
      expect(dictionary[0].serviceIdentifier).eql(ninjaId);
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

      @injectable()
      class Ninja implements IWarrior {}

      @injectable()
      class Samurai implements IWarrior {}

      let warriorId = "IWarrior";

      let kernel = new Kernel();
      kernel.bind<IWarrior>(warriorId).to(Ninja);
      kernel.bind<IWarrior>(warriorId).to(Samurai);

      let _kernel: any = kernel;
      let dictionary = _kernel._bindingDictionary._dictionary;

      expect(dictionary.length).eql(1);
      expect(dictionary[0].serviceIdentifier).eql(warriorId);
      expect(dictionary[0].value.length).eql(2);

      let throwFunction = () => { kernel.get<IWarrior>(warriorId); };
      expect(throwFunction).to.throw(`${ERROR_MSGS.AMBIGUOUS_MATCH} ${warriorId}`);

  });

  it("Should NOT be able to getAll of an unregistered services", () => {

      interface INinja {}

      @injectable()
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

      @injectable()
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
      expect(dictionary[0].serviceIdentifier).eql(ninjaId);
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

      @injectable()
      class Ninja implements IWarrior {

          public name: string;

          public constructor(name: string) {
              this.name = name;
          }
      }

      @injectable()
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
      expect(dictionary[0].serviceIdentifier).eql(warriorId);
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

    it("Should be able to get a string literal identifier as a string", () => {
        let IKatana = "IKatana";
        let kernel = new Kernel();
        let KatanaStr = kernel.getServiceIdentifierAsString(IKatana);
        expect(KatanaStr).to.eql("IKatana");
    });

    it("Should be able to get a symbol identifier as a string", () => {
        let IKatanaSymbol = Symbol("IKatana");
        let kernel = new Kernel();
        let KatanaStr = kernel.getServiceIdentifierAsString(IKatanaSymbol);
        expect(KatanaStr).to.eql("Symbol(IKatana)");
    });

    it("Should be able to get a class identifier as a string", () => {
        class Katana {}
        let kernel = new Kernel();
        let KatanaStr = kernel.getServiceIdentifierAsString(Katana);
        expect(KatanaStr).to.eql("Katana");
    });

    it("Should be able to snapshot and restore kernel", () => {

        interface IWarrior {
        }

        @injectable()
        class Ninja implements IWarrior {}

        @injectable()
        class Samurai implements IWarrior {}

        let kernel = new Kernel();
        kernel.bind<IWarrior>(Ninja).to(Ninja);
        kernel.bind<IWarrior>(Samurai).to(Samurai);

        expect(kernel.get(Samurai)).to.be.instanceOf(Samurai);
        expect(kernel.get(Ninja)).to.be.instanceOf(Ninja);

        kernel.snapshot(); // snapshot kernel = v1

        kernel.unbind(Ninja);
        expect(kernel.get(Samurai)).to.be.instanceOf(Samurai);
        expect(() => kernel.get(Ninja)).to.throw();

        kernel.snapshot(); // snapshot kernel = v2
        expect(() => kernel.get(Ninja )).to.throw();

        kernel.bind<IWarrior>(Ninja).to(Ninja);
        expect(kernel.get(Samurai)).to.be.instanceOf(Samurai);
        expect(kernel.get(Ninja)).to.be.instanceOf(Ninja);

        kernel.restore(); // restore kernel to v2
        expect(kernel.get(Samurai)).to.be.instanceOf(Samurai);
        expect(() => kernel.get(Ninja)).to.throw();

        kernel.restore(); // restore kernel to v1
        expect(kernel.get(Samurai)).to.be.instanceOf(Samurai);
        expect(kernel.get(Ninja)).to.be.instanceOf(Ninja);

        expect(() => kernel.restore()).to.throw(ERROR_MSGS.NO_MORE_SNAPSHOTS_AVAILABLE);
    });

    it("Should be able to check is there are bindings available for a given identifier", () => {

        interface IWarrior {}
        let warriorId = "IWarrior";
        let warriorSymbol = Symbol("IWarrior");

        @injectable()
        class Ninja implements IWarrior {}

        let kernel = new Kernel();
        kernel.bind<IWarrior>(Ninja).to(Ninja);
        kernel.bind<IWarrior>(warriorId).to(Ninja);
        kernel.bind<IWarrior>(warriorSymbol).to(Ninja);

        expect(kernel.isBound(Ninja)).eql(true);
        expect(kernel.isBound(warriorId)).eql(true);
        expect(kernel.isBound(warriorSymbol)).eql(true);

        interface IKatana {}
        let katanaId = "IKatana";
        let katanaSymbol = Symbol("IKatana");

        @injectable()
        class Katana implements IKatana {}

        expect(kernel.isBound(Katana)).eql(false);
        expect(kernel.isBound(katanaId)).eql(false);
        expect(kernel.isBound(katanaSymbol)).eql(false);

    });

});
