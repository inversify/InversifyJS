import { expect } from "chai";
import { Container, inject, injectable, multiInject, named, optional, tagged } from "../../src/inversify";
describe("method injection", () => {
    it("should inject or multiinject and work with @named and @tagged", () => {
        interface Weapon {
            damage: number;
        }
        @injectable()
        class Katana implements Weapon {
            public damage = 5;
        }
        @injectable()
        class Shuriken implements Weapon {
            public damage = 8;
        }
        interface Warrior {
            health: number;
        }
        interface INinja {
            attack(warrior: Warrior): boolean;
            doubleAttack(warrior: Warrior): boolean;
            throwNoMatchingBindingWhenCalled(): void;
            doesNotThrowNoMatchingBindingWhenCalledAsOptional(): void;
            getTheKatana(): Katana;
            getAShuriken(): Shuriken;
        }
        type InjectedMethodP0I1<T extends () => any, TInjected> =
            (injected: TInjected) => ReturnType<T>;
        type InjectedMethodP1I1<T extends (arg: any) => any, TInjected> =
            (args: Parameters<T>[0], injected: TInjected) => ReturnType<T>;
        /* type InjectedMethodP2I1<T extends (arg1: any, arg2: any) => any, TInjected> =
            (args: Parameters<T>[0], injected: TInjected) => ReturnType<T>;
        type InjectedMethodP1I2<T extends (arg: any) => any, TInjected, TInjected2> =
            (args: Parameters<T>[0], injected: TInjected, injected2: TInjected2) => ReturnType<T>; */
        type InjectedTypeP0I1<T extends { [ P in TProperty]: () => any}, TProperty extends keyof T, TInjected> = {
            [P in TProperty]: InjectedMethodP0I1<T[TProperty], TInjected>
        };
        type InjectedTypeP1I1<T extends { [ P in TProperty]: (arg: any) => any}, TProperty extends keyof T,  TInjected> = {
            [P in TProperty]: InjectedMethodP1I1<T[TProperty], TInjected>
        };
        type PropertiesOfOther<T> = {
            [P in keyof T]: any
        };
        /* type InjectedTypeP2I1<T extends { [ P in TProperty]: (arg1: any, arg2: any) => any}, TProperty extends keyof T,  TInjected> = {
            [P in TProperty]: InjectedMethodP2I1<T[TProperty], TInjected>
        }; */

        @injectable()
        class Ninja implements
            InjectedTypeP1I1<INinja, "attack", Weapon>,
            InjectedTypeP1I1<INinja, "doubleAttack", Weapon[]>,
            InjectedTypeP0I1<INinja, "throwNoMatchingBindingWhenCalled", string>,
            InjectedTypeP0I1<INinja, "throwNoMatchingBindingWhenCalled", string | undefined>,
            InjectedTypeP0I1<INinja, "getTheKatana", Katana>,
            InjectedTypeP0I1<INinja, "getAShuriken", Shuriken>,
            PropertiesOfOther<INinja> {
            private _skill: number;
            constructor(@inject("NinjaSkill") skill: number) {
                this._skill = skill;
            }
            public attack(warrior: Warrior, @inject("Weapon") weapon: Weapon): boolean {
                //this context correct
                return warrior.health < (weapon!.damage + this._skill);
            }
            public doubleAttack(warrior: Warrior, @multiInject("ComboWeapon") weapons: Weapon[]): boolean {
                let totalDamage = 0;
                weapons!.forEach((w) => totalDamage += w.damage);
                return warrior.health < totalDamage;
            }
            public throwNoMatchingBindingWhenCalled(@inject("NoMatch") noMatch: string) {
                //
            }
            public doesNotThrowNoMatchingBindingWhenCalledAsOptional(@inject("NoMatch") @optional() noMatch: string | undefined): void {
                //
            }
            public getTheKatana(@inject("ScopedWeapon") @named("Singleton") katana: Katana): Katana {
                return katana;
            }
            public getAShuriken(@inject("ScopedWeapon") @tagged("Scoped", "Transient") shuriken: Shuriken): Shuriken {
                return shuriken;
            }
        }

        const container = new Container();
        container.bind("Ninja").to(Ninja);
        container.bind("NinjaSkill").toConstantValue(10);
        container.bind("Weapon").to(Katana);
        container.bind("ComboWeapon").to(Katana);
        container.bind("ComboWeapon").to(Shuriken);
        container.bind("ScopedWeapon").to(Katana).inSingletonScope().whenTargetNamed("Singleton");
        container.bind("ScopedWeapon").to(Shuriken).whenTargetTagged("Scoped", "Transient");

        const ninja = container.get<INinja>("Ninja");

        expect(ninja.attack({health: 14})).to.eql(true);
        expect(ninja.attack({health: 16})).to.eql(false);

        expect(ninja.doubleAttack({health: 14})).to.eql(false);
        expect(ninja.doubleAttack({health: 10})).to.eql(true);

        //throws only when call the method
        expect(() => ninja.throwNoMatchingBindingWhenCalled()).to.throw();

        expect(() => ninja.doesNotThrowNoMatchingBindingWhenCalledAsOptional()).not.to.throw();

        //transient scope, tagged
        const shuriken1 = ninja.getAShuriken();
        const shuriken2 = ninja.getAShuriken();
        expect(shuriken1).not.equal(shuriken2);

        //singleton scope, named
        const katana1 = ninja.getTheKatana();
        const katana2 = ninja.getTheKatana();
        expect(katana1).equal(katana2);

    });
});
