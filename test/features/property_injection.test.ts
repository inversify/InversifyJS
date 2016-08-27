import { expect } from "chai";
import "es6-symbol/implement";
import {
    Kernel, injectable, inject, named
} from "../../src/inversify";

describe("Property Injection", () => {

    it("Should be able to inject a property", () => {

        let TYPES = {
            Warrior: "Warrior",
            Weapon: "Weapon"
        };

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

        interface Warrior {
            name: string;
            weapon: Weapon;
        }

        @injectable()
        class Samurai implements Warrior {
            public name: string;
            @inject(TYPES.Weapon)
            public weapon: Weapon;
            public constructor() {
                this.name = "Samurai";
            }
        }

        let kernel = new Kernel();
        kernel.bind<Warrior>(TYPES.Warrior).to(Samurai);
        kernel.bind<Weapon>(TYPES.Weapon).to(Katana);

        let warrior = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior.name).to.eql("Samurai");
        expect(warrior.weapon).not.to.eql(undefined);
        expect(warrior.weapon.name).to.eql("Katana");

    });

    it("Should be able to inject a property combined with constructor injection", () => {

        let TYPES = {
            Warrior: "Warrior",
            Weapon: "Weapon"
        };

        let TAGS = {
            Primary: "Primary",
            Secondary: "Secondary"
        };

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

        @injectable()
        class Shuriken implements Weapon {
            public name: string;
            public constructor() {
                this.name = "Shuriken";
            }
        }

        interface Warrior {
            name: string;
            primaryWeapon: Weapon;
            secondaryWeapon: Weapon;
        }

        @injectable()
        class Samurai implements Warrior {

            public name: string;
            public primaryWeapon: Weapon;

            @inject(TYPES.Weapon)
            @named(TAGS.Secondary)
            public secondaryWeapon: Weapon;

            public constructor(
                @inject(TYPES.Weapon) @named(TAGS.Primary) weapon: Weapon
            ) {
                this.name = "Samurai";
                this.primaryWeapon = weapon;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Warrior>(TYPES.Warrior).to(Samurai);
        kernel.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetNamed(TAGS.Primary);
        kernel.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAGS.Secondary);

        let warrior = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior.name).to.eql("Samurai");
        expect(warrior.primaryWeapon).not.to.eql(undefined);
        expect(warrior.primaryWeapon.name).to.eql("Katana");
        expect(warrior.secondaryWeapon).not.to.eql(undefined);
        expect(warrior.secondaryWeapon.name).to.eql("Shuriken");

    });

    it("Should be able to inject a property in a base class");

    it("Should be able to inject a property using contextual constrains");

});
