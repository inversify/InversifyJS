import { expect } from "chai";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

import {
    Kernel,
    injectable,
    named,
    inject
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

});
