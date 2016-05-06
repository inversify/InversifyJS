///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";

import {
    makePropertyInjectNamedDecorator,
    makePropertyInjectDecorator,
    makePropertyInjectTaggedDecorator
} from "../../src/annotation/property_injectors";

import Kernel from "../../src/kernel/kernel";
import injectable from "../../src/annotation/injectable";
import named from "../../src/annotation/named";
import tagged from "../../src/annotation/tagged";

describe("makePropertyInjectDecorator and makePropertyMultiInjectDecorator", () => {

    let TYPES = { IWeapon: "IWeapon" };

    interface IWeapon {
        name: string;
        durability: number;
        use(): void;
    }

    @injectable()
    class Sword implements IWeapon {
        public name: string;
        public durability: number;
        public constructor() {
            this.durability = 100;
            this.name = "Sword";
        }
        public use() {
            this.durability = this.durability - 10;
        }
    }

    @injectable()
    class Shuriken implements IWeapon {
        public name: string;
        public durability: number;
        public constructor() {
            this.durability = 100;
            this.name = "Shuriken";
        }
        public use() {
            this.durability = this.durability - 10;
        }
    }

    it("Should support named constraints", () => {

        let kernel = new Kernel();
        let injectNamed = makePropertyInjectNamedDecorator(kernel);

        class Warrior {

            @injectNamed(TYPES.IWeapon, "not-throwwable")
            @named("not-throwwable")
            public primaryWeapon: IWeapon;

            @injectNamed(TYPES.IWeapon, "throwwable")
            @named("throwwable")
            public secondaryWeapon: IWeapon;

        }

        kernel.bind<IWeapon>(TYPES.IWeapon).to(Sword).whenTargetNamed("not-throwwable");
        kernel.bind<IWeapon>(TYPES.IWeapon).to(Shuriken).whenTargetNamed("throwwable");

        let warrior1 = new Warrior();

        expect(warrior1.primaryWeapon).to.be.instanceof(Sword);
        expect(warrior1.secondaryWeapon).to.be.instanceof(Shuriken);

    });

    it("Should support tagged constraints", () => {

        let kernel = new Kernel();
        let injectTagged = makePropertyInjectTaggedDecorator(kernel);

        class Warrior {

            @injectTagged(TYPES.IWeapon, "throwwable", false)
            @tagged("throwwable", false)
            public primaryWeapon: IWeapon;

            @injectTagged(TYPES.IWeapon, "throwwable", true)
            @tagged("throwwable", true)
            public secondaryWeapon: IWeapon;

        }

        kernel.bind<IWeapon>(TYPES.IWeapon).to(Sword).whenTargetTagged("throwwable", false);
        kernel.bind<IWeapon>(TYPES.IWeapon).to(Shuriken).whenTargetTagged("throwwable", true);

        let warrior1 = new Warrior();
        expect(warrior1.primaryWeapon).to.be.instanceof(Sword);
        expect(warrior1.secondaryWeapon).to.be.instanceof(Shuriken);

    });

    it("Should NOT break the property setter", () => {

        let kernel = new Kernel();
        let inject = makePropertyInjectDecorator(kernel);

        class Warrior {
            @inject(TYPES.IWeapon)
            public weapon: IWeapon;
        }

        kernel.bind<IWeapon>(TYPES.IWeapon).to(Sword);

        let warrior1 = new Warrior();
        expect(warrior1.weapon).to.be.instanceof(Sword);
        warrior1.weapon = new Shuriken();
        expect(warrior1.weapon).to.be.instanceof(Shuriken);

        let warrior2 = new Warrior();
        warrior2.weapon = new Shuriken();
        expect(warrior2.weapon).to.be.instanceof(Shuriken);

    });

});
