/// <reference path="../globals.d.ts" />

import { expect } from "chai";
import "es6-symbol/implement";
import {  Kernel, injectable } from "../../src/inversify";

describe("Named default", () => {

    it("Should be able to select a default to avoid ambiguous binding exceptions", () => {

        let TYPES = {
            Warrior: "Warrior",
            Weapon: "Weapon"
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

        let kernel = new Kernel();
        kernel.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed("throwable");
        kernel.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();

        let weapon1 = kernel.getNamed<Weapon>(TYPES.Weapon, "throwable");
        let weapon2 = kernel.get<Weapon>(TYPES.Weapon);

        expect(weapon1.name).eql("Shuriken");
        expect(weapon2.name).eql("Katana");

    });

});
