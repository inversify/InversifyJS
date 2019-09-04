import { expect } from "chai";
import * as now from "performance-now";
import { Container, inject, injectable } from "../../src/inversify";

describe("inRootRequestScope", () => {

    it("Should support root request scope in basic bindings", () => {

        const TYPE = {
            DynamicWeapon: Symbol("DynamicWeapon"),
            Warrior: Symbol("Warrior"),
            Weapon: Symbol("Weapon"),
        };

        interface Weapon {
            use(): string;
        }

        interface Warrior {
            primaryWeapon: Weapon;
            dynamicWeapon: Weapon;
        }

        @injectable()
        class Katana implements Weapon {
            private _madeOn: number;
            public constructor() {
                this._madeOn = now();
            }
            public use() {
                return `Used Katana made on ${this._madeOn}!`;
            }
        }

        @injectable()
        class Samurai implements Warrior {
            public primaryWeapon: Weapon;
            public dynamicWeapon: Weapon;
            public constructor(
                @inject(TYPE.Weapon) primaryWeapon: Weapon,
                @inject(TYPE.DynamicWeapon) dynamicWeapon: Weapon
            ) {
                this.primaryWeapon = primaryWeapon;
                this.dynamicWeapon = dynamicWeapon;
            }
        }

        // Without request scope
        const container = new Container();
        container.bind<Weapon>(TYPE.Weapon).to(Katana);
        container.bind<Weapon>(TYPE.DynamicWeapon).toDynamicValue((context) => {
            return context.container.get<Weapon>(TYPE.Weapon);
        });
        container.bind<Warrior>(TYPE.Warrior).to(Samurai);
        const samurai = container.get<Warrior>(TYPE.Warrior);
        const samurai2 = container.get<Warrior>(TYPE.Warrior);

        // One requests should use two instances because scope is transient
        expect(samurai.primaryWeapon.use()).not.to.eql(samurai.dynamicWeapon.use());

        // One requests should use two instances because scope is transient
        expect(samurai2.primaryWeapon.use()).not.to.eql(samurai2.dynamicWeapon.use());

        // Two request should use two Katana instances
        // for each instance of Samuari because scope is transient
        expect(samurai.primaryWeapon.use()).not.to.eql(samurai2.primaryWeapon.use());
        expect(samurai.dynamicWeapon.use()).not.to.eql(samurai2.dynamicWeapon.use());

        // With request scope
        const container1 = new Container();
        container1.bind<Weapon>(TYPE.Weapon).to(Katana).inRequestScope(); // Important
        container1.bind<Weapon>(TYPE.DynamicWeapon).toDynamicValue((context) => {
            return context.container.get<Weapon>(TYPE.Weapon);
        });
        container1.bind<Warrior>(TYPE.Warrior).to(Samurai);
        const samurai3 = container1.get<Warrior>(TYPE.Warrior);
        const samurai4 = container1.get<Warrior>(TYPE.Warrior);

        // One requests should use two instances because scope is request scope
        expect(samurai3.primaryWeapon.use()).not.to.eql(samurai3.dynamicWeapon.use());

        // One requests should use two instances because scope is request scope
        expect(samurai4.primaryWeapon.use()).not.to.eql(samurai4.dynamicWeapon.use());

        // Two request should use one instances of Katana
        // for each instance of Samurai because scope is request scope
        expect(samurai3.primaryWeapon.use()).not.to.eql(samurai4.primaryWeapon.use());
        expect(samurai3.dynamicWeapon.use()).not.to.eql(samurai4.dynamicWeapon.use());

        // With root request scope
        const container2 = new Container();
        container2.bind<Weapon>(TYPE.Weapon).to(Katana).inRootRequestScope(); // Important
        container2.bind<Weapon>(TYPE.DynamicWeapon).toDynamicValue((context) => {
            return context.container.get<Weapon>(TYPE.Weapon);
        });
        container2.bind<Warrior>(TYPE.Warrior).to(Samurai);
        const samurai5 = container2.get<Warrior>(TYPE.Warrior);
        const samurai6 = container2.get<Warrior>(TYPE.Warrior);

        // One requests should use one instance because scope is root request scope
        expect(samurai5.primaryWeapon.use()).to.eql(samurai5.dynamicWeapon.use());

        // One requests should use one instance because scope is root request scope
        expect(samurai6.primaryWeapon.use()).to.eql(samurai6.dynamicWeapon.use());

        // Two root requests should use one instances of Katana
        // for each instance of Samurai because scope is root request scope
        expect(samurai5.primaryWeapon.use()).not.to.eql(samurai6.primaryWeapon.use());
        expect(samurai5.dynamicWeapon.use()).not.to.eql(samurai6.dynamicWeapon.use());

    });
});
