import interfaces from "../../src/interfaces/interfaces";
import { expect } from "chai";
import * as sinon from "sinon";
import Kernel from "../../src/kernel/kernel";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import injectable from "../../src/annotation/injectable";
import KernelModule from "../../src/kernel/kernel_module";
import { getServiceIdentifierAsString } from "../../src/utils/serialization";

describe("Kernel", () => {

    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

  it("Should be able to use modules as configuration", () => {

      interface Ninja {}
      interface Katana {}
      interface Shuriken {}

      @injectable()
      class Katana implements Katana {}

      @injectable()
      class Shuriken implements Shuriken {}

      @injectable()
      class Ninja implements Ninja {}

      let warriors = new KernelModule((bind: interfaces.Bind) => {
          bind<Ninja>("Ninja").to(Ninja);
      });

      let weapons = new KernelModule((bind: interfaces.Bind) => {
          bind<Katana>("Katana").to(Katana);
          bind<Shuriken>("Shuriken").to(Shuriken);
      });

      let kernel = new Kernel();
      kernel.load(warriors, weapons);

      let dictionary: Array<interfaces.KeyValuePair<interfaces.Binding<any>>> = (<any>kernel)._bindingDictionary._dictionary;
      expect(dictionary[0].serviceIdentifier).eql("Ninja");
      expect(dictionary[1].serviceIdentifier).eql("Katana");
      expect(dictionary[2].serviceIdentifier).eql("Shuriken");
      expect(dictionary.length).eql(3);

      let tryGetNinja = () => { kernel.get("Ninja"); };
      let tryGetKatana = () => { kernel.get("Katana"); };
      let tryGetShuruken = () => { kernel.get("Shuriken"); };

      kernel.unload(warriors);
      dictionary = (<any>kernel)._bindingDictionary._dictionary;
      expect(dictionary.length).eql(2);
      expect(tryGetNinja).to.throw(ERROR_MSGS.NOT_REGISTERED);
      expect(tryGetKatana).not.to.throw();
      expect(tryGetShuruken).not.to.throw();

      kernel.unload(weapons);
      dictionary = (<any>kernel)._bindingDictionary._dictionary;
      expect(dictionary.length).eql(0);
      expect(tryGetNinja).to.throw(ERROR_MSGS.NOT_REGISTERED);
      expect(tryGetKatana).to.throw(ERROR_MSGS.NOT_REGISTERED);
      expect(tryGetShuruken).to.throw(ERROR_MSGS.NOT_REGISTERED);

  });

  it("Should be able to store bindings", () => {

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}
      let ninjaId = "Ninja";

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);

      let dictionary: Array<interfaces.KeyValuePair<interfaces.Binding<any>>> = (<any>kernel)._bindingDictionary._dictionary;
      let serviceIdentifier = dictionary[0].serviceIdentifier;
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

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}
      let ninjaId = "Ninja";

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);

      let dictionary: Array<interfaces.KeyValuePair<interfaces.Binding<any>>> = (<any>kernel)._bindingDictionary._dictionary;
      let serviceIdentifier = dictionary[0].serviceIdentifier;
      expect(serviceIdentifier).eql(ninjaId);

      kernel.unbind(ninjaId);
      let length = dictionary.length;
      expect(length).eql(0);

  });

  it("Should throw when cannot unbind", () => {

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}

      let serviceIdentifier = "Ninja";
      let kernel = new Kernel();
      let throwFunction = () => { kernel.unbind("Ninja"); };
      expect(throwFunction).to.throw(`${ERROR_MSGS.CANNOT_UNBIND} ${getServiceIdentifierAsString(serviceIdentifier)}`);

  });

  it("Should unbind a binding when requested", () => {

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}
      interface Samurai {}

      @injectable()
      class Samurai implements Samurai {}

      let ninjaId = "Ninja";
      let samuraiId = "Samurai";

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Samurai>(samuraiId).to(Samurai);

      let dictionary: Array<interfaces.KeyValuePair<interfaces.Binding<any>>> = (<any>kernel)._bindingDictionary._dictionary;

      expect(dictionary.length).eql(2);
      expect(dictionary[0].serviceIdentifier).eql(ninjaId);
      expect(dictionary[1].serviceIdentifier).eql(samuraiId);

      kernel.unbind(ninjaId);
      dictionary = (<any>kernel)._bindingDictionary._dictionary;
      expect(dictionary.length).eql(1);

  });

  it("Should be able unbound all dependencies", () => {

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}

      interface Samurai {}

      @injectable()
      class Samurai implements Samurai {}

      let ninjaId = "Ninja";
      let samuraiId = "Samurai";

      let kernel = new Kernel();
      kernel.bind<Ninja>(ninjaId).to(Ninja);
      kernel.bind<Samurai>(samuraiId).to(Samurai);

      let dictionary: Array<interfaces.KeyValuePair<interfaces.Binding<any>>> = (<any>kernel)._bindingDictionary._dictionary;

      expect(dictionary.length).eql(2);
      expect(dictionary[0].serviceIdentifier).eql(ninjaId);
      expect(dictionary[1].serviceIdentifier).eql(samuraiId);

      kernel.unbindAll();
      dictionary = (<any>kernel)._bindingDictionary._dictionary;
      expect(dictionary.length).eql(0);

  });

  it("Should NOT be able to get unregistered services", () => {

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}
      let ninjaId = "Ninja";

      let kernel = new Kernel();
      let throwFunction = () => { kernel.get<Ninja>(ninjaId); };

      expect(throwFunction).to.throw(`${ERROR_MSGS.NOT_REGISTERED} ${ninjaId}`);
  });

  it("Should NOT be able to get ambiguous match", () => {

      interface Warrior {}

      @injectable()
      class Ninja implements Warrior {}

      @injectable()
      class Samurai implements Warrior {}

      let warriorId = "Warrior";

      let kernel = new Kernel();
      kernel.bind<Warrior>(warriorId).to(Ninja);
      kernel.bind<Warrior>(warriorId).to(Samurai);

      let dictionary: Array<interfaces.KeyValuePair<interfaces.Binding<any>>> = (<any>kernel)._bindingDictionary._dictionary;

      expect(dictionary.length).eql(1);
      expect(dictionary[0].serviceIdentifier).eql(warriorId);
      expect(dictionary[0].value.length).eql(2);

      let throwFunction = () => { kernel.get<Warrior>(warriorId); };
      expect(throwFunction).to.throw(`${ERROR_MSGS.AMBIGUOUS_MATCH} ${warriorId}`);

  });

  it("Should NOT be able to getAll of an unregistered services", () => {

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}
      let ninjaId = "Ninja";

      let kernel = new Kernel();
      let throwFunction = () => { kernel.getAll<Ninja>(ninjaId); };

      expect(throwFunction).to.throw(`${ERROR_MSGS.NOT_REGISTERED} ${ninjaId}`);

  });

    it("Should be able to get a string literal identifier as a string", () => {
        let Katana = "Katana";
        let KatanaStr = getServiceIdentifierAsString(Katana);
        expect(KatanaStr).to.eql("Katana");
    });

    it("Should be able to get a symbol identifier as a string", () => {
        let KatanaSymbol = Symbol("Katana");
        let KatanaStr = getServiceIdentifierAsString(KatanaSymbol);
        expect(KatanaStr).to.eql("Symbol(Katana)");
    });

    it("Should be able to get a class identifier as a string", () => {
        class Katana {}
        let KatanaStr = getServiceIdentifierAsString(Katana);
        expect(KatanaStr).to.eql("Katana");
    });

    it("Should be able to snapshot and restore kernel", () => {

        interface Warrior {
        }

        @injectable()
        class Ninja implements Warrior {}

        @injectable()
        class Samurai implements Warrior {}

        let kernel = new Kernel();
        kernel.bind<Warrior>(Ninja).to(Ninja);
        kernel.bind<Warrior>(Samurai).to(Samurai);

        expect(kernel.get(Samurai)).to.be.instanceOf(Samurai);
        expect(kernel.get(Ninja)).to.be.instanceOf(Ninja);

        kernel.snapshot(); // snapshot kernel = v1

        kernel.unbind(Ninja);
        expect(kernel.get(Samurai)).to.be.instanceOf(Samurai);
        expect(() => kernel.get(Ninja)).to.throw();

        kernel.snapshot(); // snapshot kernel = v2
        expect(() => kernel.get(Ninja )).to.throw();

        kernel.bind<Warrior>(Ninja).to(Ninja);
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

        interface Warrior {}
        let warriorId = "Warrior";
        let warriorSymbol = Symbol("Warrior");

        @injectable()
        class Ninja implements Warrior {}

        let kernel = new Kernel();
        kernel.bind<Warrior>(Ninja).to(Ninja);
        kernel.bind<Warrior>(warriorId).to(Ninja);
        kernel.bind<Warrior>(warriorSymbol).to(Ninja);

        expect(kernel.isBound(Ninja)).eql(true);
        expect(kernel.isBound(warriorId)).eql(true);
        expect(kernel.isBound(warriorSymbol)).eql(true);

        interface Katana {}
        let katanaId = "Katana";
        let katanaSymbol = Symbol("Katana");

        @injectable()
        class Katana implements Katana {}

        expect(kernel.isBound(Katana)).eql(false);
        expect(kernel.isBound(katanaId)).eql(false);
        expect(kernel.isBound(katanaSymbol)).eql(false);

    });

    it("Should be able to get services from parent kernel", () => {
        let weaponIdentifier = "Weapon";

        @injectable()
        class Katana {}

        let kernel = new Kernel();
        kernel.bind(weaponIdentifier).to(Katana);

        let childKernel = new Kernel();
        childKernel.parent = kernel;

        let secondChildKernel = new Kernel();
        secondChildKernel.parent = childKernel;

        expect(secondChildKernel.get(weaponIdentifier)).to.be.instanceOf(Katana);
    });

    it("Should prioritize requested kernel to resolve a service identifier", () => {
        let weaponIdentifier = "Weapon";

        @injectable()
        class Katana {}

        @injectable()
        class DivineRapier {}

        let kernel = new Kernel();
        kernel.bind(weaponIdentifier).to(Katana);

        let childKernel = new Kernel();
        childKernel.parent = kernel;

        let secondChildKernel = new Kernel();
        secondChildKernel.parent = childKernel;
        secondChildKernel.bind(weaponIdentifier).to(DivineRapier);

        expect(secondChildKernel.get(weaponIdentifier)).to.be.instanceOf(DivineRapier);
    });

    it("Should be able to resolve named multi-injection", () => {

        interface Intl {
            hello?: string;
            goodbye?: string;
        }

        let kernel = new Kernel();
        kernel.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetNamed("fr");
        kernel.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetNamed("fr");
        kernel.bind<Intl>("Intl").toConstantValue({ hello: "hola" }).whenTargetNamed("es");
        kernel.bind<Intl>("Intl").toConstantValue({ goodbye: "adios" }).whenTargetNamed("es");

        let fr = kernel.getAllNamed<Intl>("Intl", "fr");
        expect(fr.length).to.eql(2);
        expect(fr[0].hello).to.eql("bonjour");
        expect(fr[1].goodbye).to.eql("au revoir");

        let es = kernel.getAllNamed<Intl>("Intl", "es");
        expect(es.length).to.eql(2);
        expect(es[0].hello).to.eql("hola");
        expect(es[1].goodbye).to.eql("adios");

    });

    it("Should be able to resolve tagged multi-injection", () => {

        interface Intl {
            hello?: string;
            goodbye?: string;
        }

        let kernel = new Kernel();
        kernel.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetTagged("lang", "fr");
        kernel.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetTagged("lang", "fr");
        kernel.bind<Intl>("Intl").toConstantValue({ hello: "hola" }).whenTargetTagged("lang", "es");
        kernel.bind<Intl>("Intl").toConstantValue({ goodbye: "adios" }).whenTargetTagged("lang", "es");

        let fr = kernel.getAllTagged<Intl>("Intl", "lang", "fr");
        console.log(fr);
        expect(fr.length).to.eql(2);
        expect(fr[0].hello).to.eql("bonjour");
        expect(fr[1].goodbye).to.eql("au revoir");

        let es = kernel.getAllTagged<Intl>("Intl", "lang", "es");
        expect(es.length).to.eql(2);
        expect(es[0].hello).to.eql("hola");
        expect(es[1].goodbye).to.eql("adios");

    });

});
