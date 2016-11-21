import { expect } from "chai";
import { getServiceIdentifierAsString } from "../../src/utils/serialization";
import { getFunctionName } from "../../src/utils/serialization";
import {
    Container,
    injectable,
    named,
    inject,
    interfaces,
    unmanaged,
    targetName,
    tagged,
    multiInject
} from "../../src/inversify";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

describe("Bugs", () => {

    it("Should throw when args length of base and derived class not match", () => {

        @injectable()
        class Warrior {
            public rank: string;
            public constructor(rank: string) { // length = 1
                this.rank = rank;
            }
        }

        @injectable()
        class SamuraiMaster extends Warrior  {
            public constructor() { // length = 0
                super("master");
            }
        }

        let container = new Container();
        container.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);

        let shouldThrow = function () {
            container.get<SamuraiMaster>(SamuraiMaster);
        };

        let error = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_1 + "SamuraiMaster" + ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_2;
        expect(shouldThrow).to.throw(error);

    });

    it("Should not throw when args length of base and derived class match (property setter)", () => {

        @injectable()
        class Warrior {
            protected rank: string;
            public constructor() { // length = 0
                this.rank = null;
            }
        }

        @injectable()
        class SamuraiMaster extends Warrior {
            public constructor() { // length = 0
                super();
                this.rank = "master";
            }
        }

        let container = new Container();
        container.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
        let master: any = container.get<SamuraiMaster>(SamuraiMaster);
        expect(master.rank).eql("master");

    });

    it("Should not throw when args length of base and derived class match (inject into the derived class)", () => {

        @injectable()
        class Warrior {
            protected rank: string;
            public constructor(rank: string) { // length = 1
                this.rank = rank;
            }
        }

        let TYPES = { Rank: "Rank" };

        @injectable()
        class SamuraiMaster extends Warrior  {
            public constructor(
                @inject(TYPES.Rank) @named("master") rank: string // length = 1
            ) {
                super(rank);
            }
        }

        let container = new Container();
        container.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
        container.bind<string>(TYPES.Rank)
            .toConstantValue("master")
            .whenTargetNamed("master");

        let master: any = container.get<SamuraiMaster>(SamuraiMaster);
        expect(master.rank).eql("master");

    });

    it("Should not throw when args length of base and derived class match (inject into the derived class with multiple args)", () => {

        @injectable()
        class Warrior {
            protected rank: string;
            public constructor(rank: string) { // length = 1
                this.rank = rank;
            }
        }

        interface Weapon {
            name: string;
        }

        @injectable()
        class Katana implements Weapon {
            public name: string;
            public constructor() {
                this.name = "Katana";
            }
        }

        let TYPES = {
            Rank: "Rank",
            Weapon: "Weapon"
        };

        @injectable()
        class SamuraiMaster extends Warrior  {
            public weapon: Weapon;
            public constructor(
                @inject(TYPES.Rank) @named("master") rank: string,
                @inject(TYPES.Weapon) weapon: Weapon
            ) { // length = 2
            super(rank);
            this.weapon = weapon;
            }
        }

        let container = new Container();
        container.bind<Weapon>(TYPES.Weapon).to(Katana);
        container.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
        container.bind<string>(TYPES.Rank)
            .toConstantValue("master")
            .whenTargetNamed("master");

        let master: any = container.get<SamuraiMaster>(SamuraiMaster);
        expect(master.rank).eql("master");
        expect(master.weapon.name).eql("Katana");

    });

    it("Should be able to convert a Symbol value to a string", () => {

        interface Weapon {}

        let TYPES = {
            Weapon: Symbol("Weapon")
        };

        let container = new Container();
        let throwF = () => { container.get<Weapon>(TYPES.Weapon); };
        expect(throwF).to.throw(`${ERROR_MSGS.NOT_REGISTERED} ${getServiceIdentifierAsString(TYPES.Weapon)}`);

    });

    it("Should be not require @inject annotation in toConstructor bindings", () => {

        interface ICategorySortingFn {}
        interface IContentSortingFn {}
        interface Collection {}

        @injectable()
        class Category {
            constructor(
                public id: string,
                public title: string,
                public categoryFirstPermalink: string,
                public categoryPermalink: string,
                public pagination: number,
                public categorySortingFn: ICategorySortingFn,
                public contentSortingFn: IContentSortingFn,
                public belongsToCollection: Collection
            ) {
                // do nothing
            }
        }

        let container = new Container();
        container.bind<interfaces.Newable<Category>>("Newable<Category>").toConstructor(Category);
        let expected = container.get<interfaces.Newable<Category>>("Newable<Category>");
        expect(expected).eql(Category);

    });

    it("Should be able to combine tagged injection and constant value bindings", () => {

        let container = new Container();

        interface Intl {}

        container.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetTagged("lang", "fr");
        container.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetTagged("lang", "fr");

        let f = function() { container.getTagged<Intl>("Intl", "lang", "fr"); };
        expect(f).to.throw();

    });

    it("Should be able to combine dynamic value with singleton scope", () => {

        let container = new Container();

        container.bind<number>("transient_random").toDynamicValue((context: interfaces.Context) => {
            return Math.random();
        }).inTransientScope();

        container.bind<number>("singleton_random").toDynamicValue((context: interfaces.Context) => {
            return Math.random();
        }).inSingletonScope();

        let a = container.get<number>("transient_random");
        let b = container.get<number>("transient_random");

        expect(a).not.to.eql(b);

        let c = container.get<number>("singleton_random");
        let d = container.get<number>("singleton_random");

        expect(c).to.eql(d);

    });

    it("Should be able to use an abstract class as the serviceIdentifier", () => {

        @injectable()
        abstract class Animal {
            protected name: string;
            constructor(@unmanaged() name: string) {
                this.name = name;
            }
            public abstract makeSound(input: string): string;
            public move(meters: number) {
                return this.name + " moved " + meters + "m";
            }
        }

        @injectable()
        class Snake extends Animal {
            constructor() {
                super("Snake");
            }
            public makeSound(input: string): string {
                return "sssss" + input;
            }
            public move() {
                return "Slithering... " + super.move(5);
            }
        }

        @injectable()
        class Jungle {
            public animal: Animal;
            constructor(@inject(Animal) animal: Animal) {
                this.animal = animal;
            }
        }

        let container = new Container();
        container.bind<Animal>(Animal).to(Snake);
        container.bind<Jungle>(Jungle).to(Jungle);

        let jungle = container.get(Jungle);
        expect(jungle.animal.makeSound("zzz")).to.eql("ssssszzz");
        expect(jungle.animal.move(5)).to.eql("Slithering... Snake moved 5m");

    });

    it("Should be able to identify is a target is tagged", () => {

        let TYPES = {
            Dependency1: Symbol("Dependency1"),
            Dependency2: Symbol("Dependency2"),
            Dependency3: Symbol("Dependency3"),
            Dependency4: Symbol("Dependency4"),
            Dependency5: Symbol("Dependency5"),
            Test: Symbol("Test")
        };

        let TAGS = {
            somename: "somename",
            sometag: "sometag"
        };

        @injectable()
        class Dependency1 {
            public name: string = "Dependency1";
        }

        @injectable()
        class Dependency2 {
            public name: string = "Dependency1";
        }

        @injectable()
        class Dependency3 {
            public name: string = "Dependency1";
        }

        @injectable()
        class Dependency4 {
            public name: string = "Dependency1";
        }

        @injectable()
        class Dependency5 {
            public name: string = "Dependency1";
        }

        @injectable()
        class Base {
            public baseProp: string;
            public constructor(
                @unmanaged() baseProp: string
            ) {
                this.baseProp = baseProp;
            }
        }

        @injectable()
        class Test extends Base {

            private _prop1: Dependency1;
            private _prop2: Dependency2[];
            private _prop3: Dependency3;
            private _prop4: Dependency4;
            private _prop5: Dependency5;

            public constructor(
                @inject(TYPES.Dependency1) prop1: Dependency1, // inject
                @multiInject(TYPES.Dependency2) prop2: Dependency2[], // multi inject
                @inject(TYPES.Dependency3) @named(TAGS.somename) prop3: Dependency3, // named
                @inject(TYPES.Dependency4) @tagged(TAGS.sometag, true) prop4: Dependency4, // tagged
                @inject(TYPES.Dependency5) @targetName("prop6") prop5: Dependency5 // targetName
            ) {
                super("unmanaged!");
                this._prop1 = prop1;
                this._prop2 = prop2;
                this._prop3 = prop3;
                this._prop4 = prop4;
                this._prop5 = prop5;
            }
        }

        let container = new Container();
        container.bind<Test>(TYPES.Test).to(Test);
        container.bind<Dependency1>(TYPES.Dependency1).to(Dependency1);
        container.bind<Dependency2>(TYPES.Dependency2).to(Dependency2);
        container.bind<Dependency3>(TYPES.Dependency3).to(Dependency3);
        container.bind<Dependency4>(TYPES.Dependency4).to(Dependency4);
        container.bind<Dependency5>(TYPES.Dependency5).to(Dependency5);

        function logger(next: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {

                let nextContextInterceptor = args.contextInterceptor;

                args.contextInterceptor = (context: interfaces.Context) => {

                    context.plan.rootRequest.childRequests.forEach((request, index) => {
                        switch (index) {
                            case 0:
                                expect(request.target.isNamed()).to.eql(false);
                                expect(request.target.isTagged()).to.eql(false);
                                break;
                            case 1:
                                expect(request.target.isNamed()).to.eql(false);
                                expect(request.target.isTagged()).to.eql(false);
                                break;
                            case 2:
                                expect(request.target.isNamed()).to.eql(true);
                                expect(request.target.isTagged()).to.eql(false);
                                break;
                            case 3:
                                expect(request.target.isNamed()).to.eql(false);
                                expect(request.target.isTagged()).to.eql(true);
                                break;
                            case 4:
                                expect(request.target.isNamed()).to.eql(false);
                                expect(request.target.isTagged()).to.eql(false);
                                break;
                        }
                    });

                    return nextContextInterceptor(context);
                };

                let result = next(args);

                return result;
            };
        }

        container.applyMiddleware(logger);
        container.get<Test>(TYPES.Test);

    });

    it("Helper getFunctionName should not throw when using an anonymous function", () => {

        let name = getFunctionName(function (options: any) {
            this.configure(options);
        });

        expect(name).to.eql("Anonymous function: " + (function (options: any) {
            this.configure(options);
        }).toString());

    });

});
