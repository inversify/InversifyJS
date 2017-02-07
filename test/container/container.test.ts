import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { Container } from "../../src/container/container";
import { injectable } from "../../src/annotation/injectable";
import { ContainerModule } from "../../src/container/container_module";
import { getServiceIdentifierAsString } from "../../src/utils/serialization";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import * as sinon from "sinon";
import { BindingScopeEnum } from "../../src/constants/literal_types";
import { getBindingDictionary } from "../../src/planning/planner";

type Dictionary = Map<interfaces.ServiceIdentifier<any>, interfaces.Binding<any>[]>;

describe("Container", () => {

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

      let warriors = new ContainerModule((bind: interfaces.Bind) => {
          bind<Ninja>("Ninja").to(Ninja);
      });

      let weapons = new ContainerModule((bind: interfaces.Bind) => {
          bind<Katana>("Katana").to(Katana);
          bind<Shuriken>("Shuriken").to(Shuriken);
      });

      let container = new Container();
      container.load(warriors, weapons);

      let map: Dictionary = getBindingDictionary(container).getMap();
      expect(map.has("Ninja")).eql(true);
      expect(map.has("Katana")).eql(true);
      expect(map.has("Shuriken")).eql(true);
      expect(map.size).eql(3);

      let tryGetNinja = () => { container.get("Ninja"); };
      let tryGetKatana = () => { container.get("Katana"); };
      let tryGetShuruken = () => { container.get("Shuriken"); };

      container.unload(warriors);
      map = getBindingDictionary(container).getMap();
      expect(map.size).eql(2);
      expect(tryGetNinja).to.throw(ERROR_MSGS.NOT_REGISTERED);
      expect(tryGetKatana).not.to.throw();
      expect(tryGetShuruken).not.to.throw();

      container.unload(weapons);
      map = getBindingDictionary(container).getMap();
      expect(map.size).eql(0);
      expect(tryGetNinja).to.throw(ERROR_MSGS.NOT_REGISTERED);
      expect(tryGetKatana).to.throw(ERROR_MSGS.NOT_REGISTERED);
      expect(tryGetShuruken).to.throw(ERROR_MSGS.NOT_REGISTERED);

  });

  it("Should be able to store bindings", () => {

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}
      let ninjaId = "Ninja";

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);

      let map: Dictionary = getBindingDictionary(container).getMap();
      expect(map.size).eql(1);
      expect(map.has(ninjaId)).eql(true);

  });

  it("Should have an unique identifier", () => {

      let container1 = new Container();
      let container2 = new Container();
      expect(container1.guid.length).eql(36);
      expect(container2.guid.length).eql(36);
      expect(container1.guid).not.eql(container2.guid);

  });

  it("Should unbind a binding when requested", () => {

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}
      let ninjaId = "Ninja";

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);

      let map: Dictionary = getBindingDictionary(container).getMap();
      expect(map.has(ninjaId)).eql(true);

      container.unbind(ninjaId);
      expect(map.has(ninjaId)).eql(false);
      expect(map.size).eql(0);

  });

  it("Should throw when cannot unbind", () => {

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}

      let serviceIdentifier = "Ninja";
      let container = new Container();
      let throwFunction = () => { container.unbind("Ninja"); };
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

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Samurai>(samuraiId).to(Samurai);

      let map: Dictionary = getBindingDictionary(container).getMap();

      expect(map.size).eql(2);
      expect(map.has(ninjaId)).eql(true);
      expect(map.has(samuraiId)).eql(true);

      container.unbind(ninjaId);
      map = getBindingDictionary(container).getMap();
      expect(map.size).eql(1);

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

      let container = new Container();
      container.bind<Ninja>(ninjaId).to(Ninja);
      container.bind<Samurai>(samuraiId).to(Samurai);

      let map: Dictionary = getBindingDictionary(container).getMap();

      expect(map.size).eql(2);
      expect(map.has(ninjaId)).eql(true);
      expect(map.has(samuraiId)).eql(true);

      container.unbindAll();
      map = getBindingDictionary(container).getMap();
      expect(map.size).eql(0);

  });

  it("Should NOT be able to get unregistered services", () => {

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}
      let ninjaId = "Ninja";

      let container = new Container();
      let throwFunction = () => { container.get<Ninja>(ninjaId); };

      expect(throwFunction).to.throw(`${ERROR_MSGS.NOT_REGISTERED} ${ninjaId}`);
  });

  it("Should NOT be able to get ambiguous match", () => {

      interface Warrior {}

      @injectable()
      class Ninja implements Warrior {}

      @injectable()
      class Samurai implements Warrior {}

      let warriorId = "Warrior";

      let container = new Container();
      container.bind<Warrior>(warriorId).to(Ninja);
      container.bind<Warrior>(warriorId).to(Samurai);

      type Dictionary = Map<interfaces.ServiceIdentifier<any>, interfaces.Binding<any>[]>;
      let dictionary: Dictionary = getBindingDictionary(container).getMap();

      expect(dictionary.size).eql(1);
      dictionary.forEach((value, key) => {
          expect(key).eql(warriorId);
          expect(value.length).eql(2);
      });

      let throwFunction = () => { container.get<Warrior>(warriorId); };
      expect(throwFunction).to.throw(`${ERROR_MSGS.AMBIGUOUS_MATCH} ${warriorId}`);

  });

  it("Should NOT be able to getAll of an unregistered services", () => {

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {}
      let ninjaId = "Ninja";

      let container = new Container();
      let throwFunction = () => { container.getAll<Ninja>(ninjaId); };

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

    it("Should be able to snapshot and restore container", () => {

        interface Warrior {
        }

        @injectable()
        class Ninja implements Warrior {}

        @injectable()
        class Samurai implements Warrior {}

        let container = new Container();
        container.bind<Warrior>(Ninja).to(Ninja);
        container.bind<Warrior>(Samurai).to(Samurai);

        expect(container.get(Samurai)).to.be.instanceOf(Samurai);
        expect(container.get(Ninja)).to.be.instanceOf(Ninja);

        container.snapshot(); // snapshot container = v1

        container.unbind(Ninja);
        expect(container.get(Samurai)).to.be.instanceOf(Samurai);
        expect(() => container.get(Ninja)).to.throw();

        container.snapshot(); // snapshot container = v2
        expect(() => container.get(Ninja )).to.throw();

        container.bind<Warrior>(Ninja).to(Ninja);
        expect(container.get(Samurai)).to.be.instanceOf(Samurai);
        expect(container.get(Ninja)).to.be.instanceOf(Ninja);

        container.restore(); // restore container to v2
        expect(container.get(Samurai)).to.be.instanceOf(Samurai);
        expect(() => container.get(Ninja)).to.throw();

        container.restore(); // restore container to v1
        expect(container.get(Samurai)).to.be.instanceOf(Samurai);
        expect(container.get(Ninja)).to.be.instanceOf(Ninja);

        expect(() => container.restore()).to.throw(ERROR_MSGS.NO_MORE_SNAPSHOTS_AVAILABLE);
    });

    it("Should be able to check is there are bindings available for a given identifier", () => {

        interface Warrior {}
        let warriorId = "Warrior";
        let warriorSymbol = Symbol("Warrior");

        @injectable()
        class Ninja implements Warrior {}

        let container = new Container();
        container.bind<Warrior>(Ninja).to(Ninja);
        container.bind<Warrior>(warriorId).to(Ninja);
        container.bind<Warrior>(warriorSymbol).to(Ninja);

        expect(container.isBound(Ninja)).eql(true);
        expect(container.isBound(warriorId)).eql(true);
        expect(container.isBound(warriorSymbol)).eql(true);

        interface Katana {}
        let katanaId = "Katana";
        let katanaSymbol = Symbol("Katana");

        @injectable()
        class Katana implements Katana {}

        expect(container.isBound(Katana)).eql(false);
        expect(container.isBound(katanaId)).eql(false);
        expect(container.isBound(katanaSymbol)).eql(false);

    });

    it("Should be able to get services from parent container", () => {
        let weaponIdentifier = "Weapon";

        @injectable()
        class Katana {}

        let container = new Container();
        container.bind(weaponIdentifier).to(Katana);

        let childContainer = new Container();
        childContainer.parent = container;

        let secondChildContainer = new Container();
        secondChildContainer.parent = childContainer;

        expect(secondChildContainer.get(weaponIdentifier)).to.be.instanceOf(Katana);
    });

    it("Should prioritize requested container to resolve a service identifier", () => {
        let weaponIdentifier = "Weapon";

        @injectable()
        class Katana {}

        @injectable()
        class DivineRapier {}

        let container = new Container();
        container.bind(weaponIdentifier).to(Katana);

        let childContainer = new Container();
        childContainer.parent = container;

        let secondChildContainer = new Container();
        secondChildContainer.parent = childContainer;
        secondChildContainer.bind(weaponIdentifier).to(DivineRapier);

        expect(secondChildContainer.get(weaponIdentifier)).to.be.instanceOf(DivineRapier);
    });

    it("Should be able to resolve named multi-injection", () => {

        interface Intl {
            hello?: string;
            goodbye?: string;
        }

        let container = new Container();
        container.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetNamed("fr");
        container.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetNamed("fr");
        container.bind<Intl>("Intl").toConstantValue({ hello: "hola" }).whenTargetNamed("es");
        container.bind<Intl>("Intl").toConstantValue({ goodbye: "adios" }).whenTargetNamed("es");

        let fr = container.getAllNamed<Intl>("Intl", "fr");
        expect(fr.length).to.eql(2);
        expect(fr[0].hello).to.eql("bonjour");
        expect(fr[1].goodbye).to.eql("au revoir");

        let es = container.getAllNamed<Intl>("Intl", "es");
        expect(es.length).to.eql(2);
        expect(es[0].hello).to.eql("hola");
        expect(es[1].goodbye).to.eql("adios");

    });

    it("Should be able to resolve tagged multi-injection", () => {

        interface Intl {
            hello?: string;
            goodbye?: string;
        }

        let container = new Container();
        container.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetTagged("lang", "fr");
        container.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetTagged("lang", "fr");
        container.bind<Intl>("Intl").toConstantValue({ hello: "hola" }).whenTargetTagged("lang", "es");
        container.bind<Intl>("Intl").toConstantValue({ goodbye: "adios" }).whenTargetTagged("lang", "es");

        let fr = container.getAllTagged<Intl>("Intl", "lang", "fr");
        expect(fr.length).to.eql(2);
        expect(fr[0].hello).to.eql("bonjour");
        expect(fr[1].goodbye).to.eql("au revoir");

        let es = container.getAllTagged<Intl>("Intl", "lang", "es");
        expect(es.length).to.eql(2);
        expect(es[0].hello).to.eql("hola");
        expect(es[1].goodbye).to.eql("adios");

    });

    it("Should be able configure the default scope at a global level", () => {

        interface Warrior {
            health: number;
            takeHit: (damage: number) => void;
        }

        @injectable()
        class Ninja implements Warrior {
            public health: number;
            public constructor() {
                this.health = 100;
            }
            public takeHit(damage: number) {
                this.health = this.health - damage;
            }
        }

        let TYPES = {
            Warrior: "Warrior"
        };

        let container1 = new Container();
        container1.bind<Warrior>(TYPES.Warrior).to(Ninja);

        let transientNinja1 = container1.get<Warrior>(TYPES.Warrior);
        expect(transientNinja1.health).to.eql(100);
        transientNinja1.takeHit(10);
        expect(transientNinja1.health).to.eql(90);

        let transientNinja2 = container1.get<Warrior>(TYPES.Warrior);
        expect(transientNinja2.health).to.eql(100);
        transientNinja2.takeHit(10);
        expect(transientNinja2.health).to.eql(90);

        let container2 = new Container({ defaultScope: BindingScopeEnum.Singleton });
        container2.bind<Warrior>(TYPES.Warrior).to(Ninja);

        let singletonNinja1 = container2.get<Warrior>(TYPES.Warrior);
        expect(singletonNinja1.health).to.eql(100);
        singletonNinja1.takeHit(10);
        expect(singletonNinja1.health).to.eql(90);

        let singletonNinja2 = container2.get<Warrior>(TYPES.Warrior);
        expect(singletonNinja2.health).to.eql(90);
        singletonNinja2.takeHit(10);
        expect(singletonNinja2.health).to.eql(80);

    });

    it("Should be throw an exception if incorrect options is provided", () => {

        let invalidOptions1: any = () => 0;
        let wrong1 = () => new Container(invalidOptions1);
        expect(wrong1).to.throw(`${ERROR_MSGS.CONTAINER_OPTIONS_MUST_BE_AN_OBJECT}`);

        let invalidOptions2: any = { wrongKey: "singleton" };
        let wrong2 = () => new Container(invalidOptions2);
        expect(wrong2).to.throw(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_DEFAULT_SCOPE}`);

        let invalidOptions3: any = { defaultScope: "wrongValue" };
        let wrong3 = () => new Container(invalidOptions3);
        expect(wrong3).to.throw(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_DEFAULT_SCOPE}`);

    });

    it("Should be able to merge multiple containers", () => {

        @injectable()
        class Ninja {
            public name = "Ninja";
        }

        @injectable()
        class Shuriken {
            public name = "Shuriken";
        }

        let CHINA_EXPANSION_TYPES = {
            Ninja: "Ninja",
            Shuriken: "Shuriken"
        };

        let chinaExpansionContainer = new Container();
        chinaExpansionContainer.bind<Ninja>(CHINA_EXPANSION_TYPES.Ninja).to(Ninja);
        chinaExpansionContainer.bind<Shuriken>(CHINA_EXPANSION_TYPES.Shuriken).to(Shuriken);

        @injectable()
        class Samurai {
            public name = "Samurai";
        }

        @injectable()
        class Katana {
            public name = "Katana";
        }

        let JAPAN_EXPANSION_TYPES = {
            Katana: "Katana",
            Samurai: "Samurai"
        };

        let japanExpansionContainer = new Container();
        japanExpansionContainer.bind<Samurai>(JAPAN_EXPANSION_TYPES.Samurai).to(Samurai);
        japanExpansionContainer.bind<Katana>(JAPAN_EXPANSION_TYPES.Katana).to(Katana);

        let gameContainer = Container.merge(chinaExpansionContainer, japanExpansionContainer);
        expect(gameContainer.get<Ninja>(CHINA_EXPANSION_TYPES.Ninja).name).to.eql("Ninja");
        expect(gameContainer.get<Shuriken>(CHINA_EXPANSION_TYPES.Shuriken).name).to.eql("Shuriken");
        expect(gameContainer.get<Samurai>(JAPAN_EXPANSION_TYPES.Samurai).name).to.eql("Samurai");
        expect(gameContainer.get<Katana>(JAPAN_EXPANSION_TYPES.Katana).name).to.eql("Katana");

    });

    it("Should be able create a child containers", () => {
        let parent = new Container();
        let child = parent.createChild();
        if (child.parent === null) {
            throw new Error("Parent should not be null");
        }
        expect(child.parent.guid).to.eql(parent.guid);
    });

    it("Should be able check if a named binding is bound", () => {

        const zero = "Zero";
        const invalidDivisor = "InvalidDivisor";
        const validDivisor = "ValidDivisor";
        let container = new Container();

        expect(container.isBound(zero)).to.eql(false);
        container.bind<number>(zero).toConstantValue(0);
        expect(container.isBound(zero)).to.eql(true);

        container.unbindAll();
        expect(container.isBound(zero)).to.eql(false);
        container.bind<number>(zero).toConstantValue(0).whenTargetNamed(invalidDivisor);
        expect(container.isBoundNamed(zero, invalidDivisor)).to.eql(true);
        expect(container.isBoundNamed(zero, validDivisor)).to.eql(false);

        container.bind<number>(zero).toConstantValue(1).whenTargetNamed(validDivisor);
        expect(container.isBoundNamed(zero, invalidDivisor)).to.eql(true);
        expect(container.isBoundNamed(zero, validDivisor)).to.eql(true);

    });

    it("Should be able check if a tagged binding is bound", () => {

        const zero = "Zero";
        const isValidDivisor = "IsValidDivisor";
        let container = new Container();

        expect(container.isBound(zero)).to.eql(false);
        container.bind<number>(zero).toConstantValue(0);
        expect(container.isBound(zero)).to.eql(true);

        container.unbindAll();
        expect(container.isBound(zero)).to.eql(false);
        container.bind<number>(zero).toConstantValue(0).whenTargetTagged(isValidDivisor, false);
        expect(container.isBoundTagged(zero, isValidDivisor, false)).to.eql(true);
        expect(container.isBoundTagged(zero, isValidDivisor, true)).to.eql(false);

        container.bind<number>(zero).toConstantValue(1).whenTargetTagged(isValidDivisor, true);
        expect(container.isBoundTagged(zero, isValidDivisor, false)).to.eql(true);
        expect(container.isBoundTagged(zero, isValidDivisor, true)).to.eql(true);

    });

    it("Should be able to override a binding using rebind", () => {

        let TYPES = {
            someType: "someType"
        };

        let container = new Container();
        container.bind<number>(TYPES.someType).toConstantValue(1);
        container.bind<number>(TYPES.someType).toConstantValue(2);

        let values1 = container.getAll(TYPES.someType);
        expect(values1[0]).to.eq(1);
        expect(values1[1]).to.eq(2);

        container.rebind<number>(TYPES.someType).toConstantValue(3);
        let values2 = container.getAll(TYPES.someType);
        expect(values2[0]).to.eq(3);
        expect(values2[1]).to.eq(undefined);

    });

});
