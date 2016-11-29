import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { plan } from "../../src/planning/planner";
import { Container } from "../../src/container/container";
import { TargetTypeEnum } from "../../src/constants/literal_types";
import { injectable } from "../../src/annotation/injectable";
import { targetName } from "../../src/annotation/target_name";
import { tagged } from "../../src/annotation/tagged";
import { inject } from "../../src/annotation/inject";
import { multiInject } from "../../src/annotation/multi_inject";
import * as sinon from "sinon";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

describe("Planner", () => {

    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
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

        let container = new Container();
        container.bind<Ninja>(ninjaId).to(Ninja);
        container.bind<Shuriken>(shurikenId).to(Shuriken);
        container.bind<Katana>(katanaId).to(Katana);
        container.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
        container.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler);

        // Actual
        let actualPlan = plan(container, false, TargetTypeEnum.Variable, ninjaId).plan;
        let actualNinjaRequest = actualPlan.rootRequest;
        let actualKatanaRequest = actualNinjaRequest.childRequests[0];
        let actualKatanaHandlerRequest = actualKatanaRequest.childRequests[0];
        let actualKatanaBladeRequest = actualKatanaRequest.childRequests[1];
        let actualShurikenRequest = actualNinjaRequest.childRequests[1];

        expect(actualNinjaRequest.serviceIdentifier).eql(ninjaId);
        expect(actualNinjaRequest.childRequests.length).eql(2);

        // Katana
        expect(actualKatanaRequest.serviceIdentifier).eql(katanaId);
        expect(actualKatanaRequest.bindings.length).eql(1);
        expect(actualKatanaRequest.target.serviceIdentifier).eql(katanaId);
        expect(actualKatanaRequest.childRequests.length).eql(2);

        // KatanaHandler
        expect(actualKatanaHandlerRequest.serviceIdentifier).eql(katanaHandlerId);
        expect(actualKatanaHandlerRequest.bindings.length).eql(1);
        expect(actualKatanaHandlerRequest.target.serviceIdentifier).eql(katanaHandlerId);

        // KatanaBalde
        expect(actualKatanaBladeRequest.serviceIdentifier).eql(katanaBladeId);
        expect(actualKatanaBladeRequest.bindings.length).eql(1);
        expect(actualKatanaBladeRequest.target.serviceIdentifier).eql(katanaBladeId);

        // Shuriken
        expect(actualShurikenRequest.serviceIdentifier).eql(shurikenId);
        expect(actualShurikenRequest.bindings.length).eql(1);
        expect(actualShurikenRequest.target.serviceIdentifier).eql(shurikenId);

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

        let container = new Container();
        container.bind<A>(aId).to(A);
        container.bind<B>(bId).to(B);
        container.bind<C>(cId).to(C);
        container.bind<D>(dId).to(D);

        let throwErroFunction = () => {
            container.get(aId);
        };

        expect(throwErroFunction).to.throw(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} A -> B -> C -> D -> A`);

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

        let container = new Container();
        container.bind<Ninja>(ninjaId).to(Ninja);
        container.bind<Shuriken>(shurikenId).to(Shuriken);
        container.bind<Katana>(katanaBladeId).to(Katana);
        container.bind<KatanaBlade>(katanaBladeId).to(KatanaBlade);
        container.bind<KatanaHandler>(katanaHandlerId).to(KatanaHandler);
        container.bind<interfaces.Factory<Katana>>(katanaFactoryId).toFactory<Katana>((context: interfaces.Context) => {
            return () => {
                return context.container.get<Katana>(katanaId);
            };
        });

        let actualPlan = plan(container, false, TargetTypeEnum.Variable, ninjaId).plan;

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

        let container = new Container();
        container.bind<Ninja>(ninjaId).to(Ninja);
        container.bind<Weapon>(weaponId).to(Shuriken);
        container.bind<Weapon>(weaponId).to(Katana);

        let actualPlan = plan(container, false, TargetTypeEnum.Variable, ninjaId).plan;

        // root request has no target
        expect(actualPlan.rootRequest.serviceIdentifier).eql(ninjaId);
        expect(actualPlan.rootRequest.target.serviceIdentifier).eql(ninjaId);
        expect(actualPlan.rootRequest.target.isArray()).eql(false);

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

        let container = new Container();
        container.bind<Ninja>(ninjaId).to(Ninja);
        container.bind<Shuriken>(shurikenId).to(Shuriken);

        let throwFunction = () => { plan(container, false, TargetTypeEnum.Variable, ninjaId); };
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

        let container = new Container();
        container.bind<Ninja>(ninjaId).to(Ninja);
        container.bind<Katana>(katanaId).to(Katana);
        container.bind<Katana>(katanaId).to(SharpKatana);
        container.bind<Shuriken>(shurikenId).to(Shuriken);

        let throwFunction = () => { plan(container, false, TargetTypeEnum.Variable, ninjaId); };
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

        let container = new Container();
        container.bind<Ninja>(ninjaId).to(Ninja);
        container.bind<Weapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
        container.bind<Weapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);

        let actualPlan = plan(container, false, TargetTypeEnum.Variable, ninjaId).plan;

        // root request has no target
        expect(actualPlan.rootRequest.serviceIdentifier).eql(ninjaId);
        expect(actualPlan.rootRequest.target.serviceIdentifier).eql(ninjaId);
        expect(actualPlan.rootRequest.target.isArray()).eql(false);

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

        let container = new Container();
        container.bind<Weapon>("Weapon").to(Katana);

        let throwFunction = () => {
            plan(container, false, TargetTypeEnum.Variable, "Weapon");
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

        let container = new Container();
        container.bind<Warrior>("Warrior").to(Ninja);
        container.bind<Sword>("Sword").to(Katana);

        let throwFunction = () => {
            plan(container, false, TargetTypeEnum.Variable, "Warrior");
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

        let container = new Container();
        container.bind<Ninja>("Ninja").to(Ninja);
        container.bind<Katana>("Katana").to(Katana);
        container.bind<Katana>("Factory<Katana>").to(Katana);

        let throwFunction = () => {
            plan(container, false, TargetTypeEnum.Variable, "Ninja");
        };

        expect(throwFunction).to.throw(`${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument 0 in class Ninja.`);
    });
});
