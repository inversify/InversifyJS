/// <reference path="../globals.d.ts" />

import { expect } from "chai";
import "es6-symbol/implement";
import { Kernel, injectable, named, inject } from "../../src/inversify";

describe("Named default", () => {

    it("Should be able to inject a default to avoid ambiguous binding exceptions", () => {

        let TYPES = {
            Warrior: "Warrior",
            Weapon: "Weapon"
        };

        let TAG = {
            chinese: "chinese",
            japanese: "japanese",
            throwable: "throwable"
        };

        interface Weapon {
            name: string;
        }

        interface Warrior {
            name: string;
            weapon: Weapon;
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

        @injectable()
        class Samurai implements Warrior {
            public name: string;
            public weapon: Weapon;
            public constructor(
                @inject(TYPES.Weapon) weapon: Weapon
            ) {
                this.name = "Samurai";
                this.weapon = weapon;
            }
        }

        @injectable()
        class Ninja implements Warrior {
            public name: string;
            public weapon: Weapon;
            public constructor(
                @inject(TYPES.Weapon) @named(TAG.throwable) weapon: Weapon
            ) {
                this.name = "Ninja";
                this.weapon = weapon;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Warrior>(TYPES.Warrior).to(Ninja).whenTargetNamed(TAG.chinese);
        kernel.bind<Warrior>(TYPES.Warrior).to(Samurai).whenTargetNamed(TAG.japanese);
        kernel.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
        kernel.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();

        let ninja = kernel.getNamed<Warrior>(TYPES.Warrior, TAG.chinese);
        let samurai = kernel.getNamed<Warrior>(TYPES.Warrior, TAG.japanese);

        expect(ninja.name).to.eql("Ninja");
        expect(ninja.weapon.name).to.eql("Shuriken");
        expect(samurai.name).to.eql("Samurai");
        expect(samurai.weapon.name).to.eql("Katana");

    });

    it("Should be able to select a default to avoid ambiguous binding exceptions", () => {

        let TYPES = {
            Weapon: "Weapon"
        };

        let TAG = {
            throwable: "throwable"
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

        let kernel = new Kernel();
        kernel.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
        kernel.bind<Weapon>(TYPES.Weapon).to(Katana).inSingletonScope().whenTargetIsDefault();

        let defaultWeapon = kernel.get<Weapon>(TYPES.Weapon);
        let throwableWeapon = kernel.getNamed<Weapon>(TYPES.Weapon, TAG.throwable);

        expect(defaultWeapon.name).eql("Katana");
        expect(throwableWeapon.name).eql("Shuriken");

    });

});
