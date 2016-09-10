import { expect } from "chai";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

import {
    Kernel,
    injectable,
    named,
    inject,
    interfaces,
    unmanaged
} from "../../src/inversify";

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

        let kernel = new Kernel();
        kernel.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);

        let shouldThrow = function () {
            kernel.get<SamuraiMaster>(SamuraiMaster);
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

        let kernel = new Kernel();
        kernel.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
        let master: any = kernel.get<SamuraiMaster>(SamuraiMaster);
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

        let kernel = new Kernel();
        kernel.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
        kernel.bind<string>(TYPES.Rank)
            .toConstantValue("master")
            .whenTargetNamed("master");

        let master: any = kernel.get<SamuraiMaster>(SamuraiMaster);
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

        let kernel = new Kernel();
        kernel.bind<Weapon>(TYPES.Weapon).to(Katana);
        kernel.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
        kernel.bind<string>(TYPES.Rank)
            .toConstantValue("master")
            .whenTargetNamed("master");

        let master: any = kernel.get<SamuraiMaster>(SamuraiMaster);
        expect(master.rank).eql("master");
        expect(master.weapon.name).eql("Katana");

    });

    it("Should be able to convert a Symbol value to a string", () => {

        interface Weapon {}

        let TYPES = {
            Weapon: Symbol("Weapon")
        };

        let kernel = new Kernel();
        let throwF = () => { kernel.get<Weapon>(TYPES.Weapon); };
        expect(throwF).to.throw(`${ERROR_MSGS.NOT_REGISTERED} ${kernel.getServiceIdentifierAsString(TYPES.Weapon)}`);

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

        let kernel = new Kernel();
        kernel.bind<interfaces.Newable<Category>>("Newable<Category>").toConstructor(Category);
        let expected = kernel.get<interfaces.Newable<Category>>("Newable<Category>");
        expect(expected).eql(Category);

    });

    it("Should be able to combine tagged injection and constant value bindings", () => {

        let kernel = new Kernel();

        interface Intl {}

        kernel.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetTagged("lang", "fr");
        kernel.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetTagged("lang", "fr");

        let f = function() { kernel.getTagged<Intl>("Intl", "lang", "fr"); };
        expect(f).to.throw();

    });

    it("Should be able to combine dynamic value with singleton scope", () => {

        let kernel = new Kernel();

        kernel.bind<number>("transient_random").toDynamicValue((context: interfaces.Context) => {
            return Math.random();
        }).inTransientScope();

        kernel.bind<number>("singleton_random").toDynamicValue((context: interfaces.Context) => {
            return Math.random();
        }).inSingletonScope();

        let a = kernel.get<number>("transient_random");
        let b = kernel.get<number>("transient_random");

        expect(a).not.to.eql(b);

        let c = kernel.get<number>("singleton_random");
        let d = kernel.get<number>("singleton_random");

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

        let kernel = new Kernel();
        kernel.bind<Animal>(Animal).to(Snake);
        kernel.bind<Jungle>(Jungle).to(Jungle);

        let jungle = kernel.get(Jungle);
        expect(jungle.animal.makeSound("zzz")).to.eql("ssssszzz");
        expect(jungle.animal.move(5)).to.eql("Slithering... Snake moved 5m");

    });

});
