import { expect } from "chai";
import Kernel from "../../src/kernel/kernel";
import injectable from "../../src/annotation/injectable";
import named from "../../src/annotation/named";
import tagged from "../../src/annotation/tagged";
import {
    makePropertyInjectNamedDecorator,
    makePropertyInjectDecorator,
    makePropertyInjectTaggedDecorator
} from "../../src/annotation/property_injectors";

describe("makePropertyInjectDecorator and makePropertyMultiInjectDecorator", () => {

    let TYPES = { Weapon: "Weapon" };

    interface Weapon {
        name: string;
        durability: number;
        use(): void;
    }

    @injectable()
    class Sword implements Weapon {
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
    class Shuriken implements Weapon {
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

            @injectNamed(TYPES.Weapon, "not-throwwable")
            @named("not-throwwable")
            public primaryWeapon: Weapon;

            @injectNamed(TYPES.Weapon, "throwwable")
            @named("throwwable")
            public secondaryWeapon: Weapon;

        }

        kernel.bind<Weapon>(TYPES.Weapon).to(Sword).whenTargetNamed("not-throwwable");
        kernel.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed("throwwable");

        let warrior1 = new Warrior();

        expect(warrior1.primaryWeapon).to.be.instanceof(Sword);
        expect(warrior1.secondaryWeapon).to.be.instanceof(Shuriken);

    });

    it("Should support tagged constraints", () => {

        let kernel = new Kernel();
        let injectTagged = makePropertyInjectTaggedDecorator(kernel);

        class Warrior {

            @injectTagged(TYPES.Weapon, "throwwable", false)
            @tagged("throwwable", false)
            public primaryWeapon: Weapon;

            @injectTagged(TYPES.Weapon, "throwwable", true)
            @tagged("throwwable", true)
            public secondaryWeapon: Weapon;

        }

        kernel.bind<Weapon>(TYPES.Weapon).to(Sword).whenTargetTagged("throwwable", false);
        kernel.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetTagged("throwwable", true);

        let warrior1 = new Warrior();
        expect(warrior1.primaryWeapon).to.be.instanceof(Sword);
        expect(warrior1.secondaryWeapon).to.be.instanceof(Shuriken);

    });

    it("Should NOT break the property setter", () => {

        let kernel = new Kernel();
        let inject = makePropertyInjectDecorator(kernel);

        class Warrior {
            @inject(TYPES.Weapon)
            public weapon: Weapon;
        }

        kernel.bind<Weapon>(TYPES.Weapon).to(Sword);

        let warrior1 = new Warrior();
        expect(warrior1.weapon).to.be.instanceof(Sword);
        warrior1.weapon = new Shuriken();
        expect(warrior1.weapon).to.be.instanceof(Shuriken);

        let warrior2 = new Warrior();
        warrior2.weapon = new Shuriken();
        expect(warrior2.weapon).to.be.instanceof(Shuriken);

    });

});
