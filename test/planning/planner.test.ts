import interfaces from "../../src/interfaces/interfaces";
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

    let sandbox: sinon.SinonSandbox;

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

        interface KatanaBlade { }

        @injectable()
        class KatanaBlade implements KatanaBlade { }

        interface KatanaHandler { }

        @injectable()
        class KatanaHandler implements KatanaHandler { }

        interface Katana { }

        @injectable()
        class Katana implements Katana {
            public handler: KatanaHandler;
            public blade: KatanaBlade;
            public constructor(
                @inject("KatanaHandler") @targetName("handler") handler: KatanaHandler,
                @inject("KatanaBlade") @targetName("blade") blade: KatanaBlade
            ) {
                this.handler = handler;
                this.blade = blade;
            }
        }

        interface Shuriken { }

        @injectable()
        class Shuriken implements Shuriken { }

        interface Ninja { }

        @injectable()
        class Ninja implements Ninja {
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
        let katanaHandlerId = "KatanaHandler";
        let katanaBladeId = "KatanaBlade";

        let kernel = new Kernel();
        kernel.bind<Ninja>(ninjaId).to(Ninja);
        kernel.bind<Shuriken>(shurikenId).to(Shuriken);
        kernel.bind<Katana>(katanaId).to(Katana);
        kernel.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
        kernel.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler);

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

        // Katana

        expect(actualKatanaRequest.serviceIdentifier)
            .eql(katanaRequest.serviceIdentifier);

        expect((<any>actualKatanaRequest.bindings[0].implementationType).name)
            .eql((<any>Katana).name);

        expect(actualKatanaRequest.bindings.length).eql(1);

        expect(actualKatanaRequest.target.serviceIdentifier)
            .eql(katanaRequest.target.serviceIdentifier);

        expect(actualKatanaRequest.childRequests.length)
            .eql(katanaRequest.childRequests.length);

        // KatanaHandler

        expect(actualKatanaHandlerRequest.serviceIdentifier)
            .eql(katanaHandlerRequest.serviceIdentifier);

        expect((<any>actualKatanaHandlerRequest.bindings[0].implementationType).name)
            .eql((<any>KatanaHandler).name);

        expect(actualKatanaHandlerRequest.bindings.length).eql(1);

        expect(actualKatanaHandlerRequest.target.serviceIdentifier)
            .eql(katanaHandlerRequest.target.serviceIdentifier);

        // KatanaBalde

        expect(actualKatanaBladeRequest.serviceIdentifier)
            .eql(katanaBladeRequest.serviceIdentifier);

        expect((<any>actualKatanaBladeRequest.bindings[0].implementationType).name)
            .eql((<any>KatanaBlade).name);

        expect(actualKatanaBladeRequest.bindings.length).eql(1);

        expect(actualKatanaBladeRequest.target.serviceIdentifier)
            .eql(katanaBladeRequest.target.serviceIdentifier);

        // Shuriken

        expect(actualShurikenRequest.serviceIdentifier)
            .eql(shurikenRequest.serviceIdentifier);

        expect((<any>actualShurikenRequest.bindings[0].implementationType).name)
            .eql((<any>Shuriken).name);

        expect(actualShurikenRequest.bindings.length).eql(1);

        expect(actualShurikenRequest.target.serviceIdentifier)
            .eql(shurikenRequest.target.serviceIdentifier);

    });

    it("Should throw when circular dependencies found", () => {

        interface A { }
        interface B { }
        interface C { }
        interface D { }

        @injectable()
        class D implements D {
            public a: A;
            public constructor(
                @inject("A") a: A
            ) { // circular dependency
                this.a = a;
            }
        }

        @injectable()
        class C implements C {
            public d: D;
            public constructor(
                @inject("D") d: D
            ) {
                this.d = d;
            }
        }

        @injectable()
        class B implements B { }

        @injectable()
        class A implements A {
            public b: B;
            public c: C;
            public constructor(
                @inject("B") b: B,
                @inject("C") c: C
            ) {
                this.b = b;
                this.c = c;
            }
        }

        let aId = "A";
        let bId = "B";
        let cId = "C";
        let dId = "D";

        let kernel = new Kernel();
        kernel.bind<A>(aId).to(A);
        kernel.bind<B>(bId).to(B);
        kernel.bind<C>(cId).to(C);
        kernel.bind<D>(dId).to(D);

        let throwErroFunction = () => {
            kernel.get(aId);
        };

        expect(throwErroFunction).to.throw(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} ${aId} and ${dId}`);

    });

    it("Should only plan sub-dependencies when binding type is BindingType.Instance", () => {

        interface KatanaBlade { }

        @injectable()
        class KatanaBlade implements KatanaBlade { }

        interface KatanaHandler { }

        @injectable()
        class KatanaHandler implements KatanaHandler { }

        interface Katana { }

        @injectable()
        class Katana implements Katana {
            public handler: KatanaHandler;
            public blade: KatanaBlade;
            public constructor(
                @inject("KatanaHandler") @targetName("handler") handler: KatanaHandler,
                @inject("KatanaBlade") @targetName("blade") blade: KatanaBlade
            ) {
                this.handler = handler;
                this.blade = blade;
            }
        }

        interface Shuriken { }

        @injectable()
        class Shuriken implements Shuriken { }

        interface Ninja { }

        @injectable()
        class Ninja implements Ninja {
            public katanaFactory: interfaces.Factory<Katana>;
            public shuriken: Shuriken;
            public constructor(
                @inject("Factory<Katana>") @targetName("katanaFactory") katanaFactory: interfaces.Factory<Katana>,
                @inject("Shuriken") @targetName("shuriken") shuriken: Shuriken
            ) {
                this.katanaFactory = katanaFactory;
                this.shuriken = shuriken;
            }
        }

        let ninjaId = "Ninja";
        let shurikenId = "Shuriken";
        let katanaId = "Katana";
        let katanaHandlerId = "KatanaHandler";
        let katanaBladeId = "KatanaBlade";
        let katanaFactoryId = "Factory<Katana>";

        let kernel = new Kernel();
        kernel.bind<Ninja>(ninjaId).to(Ninja);
        kernel.bind<Shuriken>(shurikenId).to(Shuriken);
        kernel.bind<Katana>(katanaBladeId).to(Katana);
        kernel.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
        kernel.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler);
        kernel.bind<interfaces.Factory<Katana>>(katanaFactoryId).toFactory<Katana>((context: interfaces.Context) => {
            return () => {
                return context.kernel.get<Katana>(katanaId);
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

        interface Weapon { }

        @injectable()
        class Katana implements Weapon { }

        @injectable()
        class Shuriken implements Weapon { }

        interface Ninja { }

        @injectable()
        class Ninja implements Ninja {
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
        kernel.bind<Weapon>(weaponId).to(Shuriken);
        kernel.bind<Weapon>(weaponId).to(Katana);

        let _kernel: any = kernel;
        let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
        let planner = new Planner();
        let context = planner.createContext(kernel);
        let actualPlan = planner.createPlan(context, ninjaBinding, null);

        // root request has no target
        expect(actualPlan.rootRequest.serviceIdentifier).eql(ninjaId);
        expect(actualPlan.rootRequest.target).eql(null);

        // root request should only have one child request with target weapons/Weapon[]
        expect(actualPlan.rootRequest.childRequests[0].serviceIdentifier).eql("Weapon");
        expect(actualPlan.rootRequest.childRequests[1]).eql(undefined);
        expect(actualPlan.rootRequest.childRequests[0].target.name.value()).eql("weapons");
        expect(actualPlan.rootRequest.childRequests[0].target.serviceIdentifier).eql("Weapon");
        expect(actualPlan.rootRequest.childRequests[0].target.isArray()).eql(true);

        // child request should have two child requests with targets weapons/Weapon[] but bindings Katana and Shuriken
        expect(actualPlan.rootRequest.childRequests[0].childRequests.length).eql(2);

        expect(actualPlan.rootRequest.childRequests[0].childRequests[0].serviceIdentifier).eql(weaponId);
        expect(actualPlan.rootRequest.childRequests[0].childRequests[0].target.name.value()).eql("weapons");
        expect(actualPlan.rootRequest.childRequests[0].childRequests[0].target.serviceIdentifier).eql("Weapon");
        expect(actualPlan.rootRequest.childRequests[0].childRequests[0].target.isArray()).eql(true);
        expect(actualPlan.rootRequest.childRequests[0].childRequests[0].serviceIdentifier).eql("Weapon");
        expect(actualPlan.rootRequest.childRequests[0].childRequests[0].bindings[0].serviceIdentifier).eql("Weapon");
        let shurikenImplementationType: any = actualPlan.rootRequest.childRequests[0].childRequests[0].bindings[0].implementationType;
        expect(shurikenImplementationType.name).eql("Shuriken");

        expect(actualPlan.rootRequest.childRequests[0].childRequests[1].serviceIdentifier).eql(weaponId);
        expect(actualPlan.rootRequest.childRequests[0].childRequests[1].target.name.value()).eql("weapons");
        expect(actualPlan.rootRequest.childRequests[0].childRequests[1].target.serviceIdentifier).eql("Weapon");
        expect(actualPlan.rootRequest.childRequests[0].childRequests[1].target.isArray()).eql(true);
        expect(actualPlan.rootRequest.childRequests[0].childRequests[1].serviceIdentifier).eql("Weapon");
        expect(actualPlan.rootRequest.childRequests[0].childRequests[1].bindings[0].serviceIdentifier).eql("Weapon");
        let katanaImplementationType: any = actualPlan.rootRequest.childRequests[0].childRequests[1].bindings[0].implementationType;
        expect(katanaImplementationType.name).eql("Katana");

    });

    it("Should throw when no matching bindings are found", () => {

        interface Katana { }
        @injectable()
        class Katana implements Katana { }

        interface Shuriken { }
        @injectable()
        class Shuriken implements Shuriken { }

        interface Ninja { }

        @injectable()
        class Ninja implements Ninja {
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

        let kernel = new Kernel();
        kernel.bind<Ninja>(ninjaId).to(Ninja);
        kernel.bind<Shuriken>(shurikenId).to(Shuriken);

        let _kernel: any = kernel;
        let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
        let planner = new Planner();
        let context = planner.createContext(kernel);

        let throwFunction = () => { planner.createPlan(context, ninjaBinding, null); };
        expect(throwFunction).to.throw(`${ERROR_MSGS.NOT_REGISTERED} Katana`);

    });

    it("Should throw when an ambiguous match is found", () => {

        interface Katana { }

        @injectable()
        class Katana implements Katana { }

        @injectable()
        class SharpKatana implements Katana { }

        interface Shuriken { }
        class Shuriken implements Shuriken { }

        interface Ninja { }

        @injectable()
        class Ninja implements Ninja {
            public katana: Katana;
            public shuriken: Shuriken;
            public constructor(
                @inject("Katana") katana: Katana,
                @inject("Shuriken") shuriken: Shuriken
            ) {
                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let ninjaId = "Ninja";
        let katanaId = "Katana";
        let shurikenId = "Shuriken";

        let kernel = new Kernel();
        kernel.bind<Ninja>(ninjaId).to(Ninja);
        kernel.bind<Katana>(katanaId).to(Katana);
        kernel.bind<Katana>(katanaId).to(SharpKatana);
        kernel.bind<Shuriken>(shurikenId).to(Shuriken);

        let _kernel: any = kernel;
        let ninjaBinding = _kernel._bindingDictionary.get(ninjaId)[0];
        let planner = new Planner();
        let context = planner.createContext(kernel);

        let throwFunction = () => { planner.createPlan(context, ninjaBinding, null); };
        expect(throwFunction).to.throw(`${ERROR_MSGS.AMBIGUOUS_MATCH} Katana`);

    });

    it("Should apply constrains when an ambiguous match is found", () => {

        interface Weapon { }

        @injectable()
        class Katana implements Weapon { }

        @injectable()
        class Shuriken implements Weapon { }

        interface Ninja { }

        let ninjaId = "Ninja";
        let weaponId = "Weapon";

        @injectable()
        class Ninja implements Ninja {
            public katana: Weapon;
            public shuriken: Weapon;
            public constructor(
                @inject(weaponId) @targetName("katana") @tagged("canThrow", false) katana: Weapon,
                @inject(weaponId) @targetName("shuriken") @tagged("canThrow", true) shuriken: Weapon
            ) {
                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Ninja>(ninjaId).to(Ninja);
        kernel.bind<Weapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
        kernel.bind<Weapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);

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

        interface Weapon { }

        class Katana implements Weapon { }

        let kernel = new Kernel();
        kernel.bind<Weapon>("Weapon").to(Katana);

        let _kernel: any = kernel;
        let ninjaBinding = _kernel._bindingDictionary.get("Weapon")[0];
        let planner = new Planner();
        let context = planner.createContext(kernel);

        let throwFunction = () => {
            planner.createPlan(context, ninjaBinding, null);
        };

        expect(throwFunction).to.throw(`${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} Katana.`);

    });

    it("Should throw when an class has a missing @inject annotation", () => {

        interface Sword { }

        @injectable()
        class Katana implements Sword { }

        interface Warrior { }

        @injectable()
        class Ninja implements Warrior {

            public katana: Katana;

            public constructor(
                katana: Sword
            ) {
                this.katana = katana;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Warrior>("Warrior").to(Ninja);
        kernel.bind<Sword>("Sword").to(Katana);

        let _kernel: any = kernel;
        let ninjaBinding = _kernel._bindingDictionary.get("Warrior")[0];
        let planner = new Planner();
        let context = planner.createContext(kernel);

        let throwFunction = () => {
            planner.createPlan(context, ninjaBinding, null);
        };

        expect(throwFunction).to.throw(`${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument 0 in class Ninja.`);

    });

    it("Should throw when a function has a missing @injectable annotation", () => {

        interface Katana { }

        @injectable()
        class Katana implements Katana { }

        interface Ninja { }

        @injectable()
        class Ninja implements Ninja {

            public katana: Katana;

            public constructor(
                katanaFactory: () => Katana
            ) {
                this.katana = katanaFactory();
            }
        }

        let kernel = new Kernel();
        kernel.bind<Ninja>("Ninja").to(Ninja);
        kernel.bind<Katana>("Katana").to(Katana);
        kernel.bind<Katana>("Factory<Katana>").to(Katana);

        let _kernel: any = kernel;
        let ninjaBinding = _kernel._bindingDictionary.get("Ninja")[0];
        let planner = new Planner();
        let context = planner.createContext(kernel);

        let throwFunction = () => {
            planner.createPlan(context, ninjaBinding, null);
        };

        expect(throwFunction).to.throw(`${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument 0 in class Ninja.`);
    });


    it("Should return a good function name", () => {
        const planner = new Planner();

        function testFunction() {
            return false;
        }

        expect((planner as any)._getFunctionName(testFunction)).eql("testFunction");
    });

    it("Should return a good function name by using the regex", () => {
        const planner = new Planner();

        const testFunction: any = { name: null };
        testFunction.toString = () => {
            return "function testFunction";
        };

        console.log((planner as any)._getFunctionName(testFunction));

        expect((planner as any)._getFunctionName(testFunction)).eql("testFunction");
    });

});
