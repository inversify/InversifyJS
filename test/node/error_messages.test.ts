import { expect } from "chai";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import * as Stubs from "../utils/stubs";
import {
    Container, injectable
} from "../../src/inversify";

describe("Error message when resolving fails", () => {
    interface Weapon { }

    @injectable()
    class Katana implements Weapon { }

    @injectable()
    class Shuriken implements Weapon { }

    @injectable()
    class Bokken implements Weapon { }

    it("Should contain correct message and the serviceIdentifier in error message", () => {
        let container = new Container();

        container.bind<Weapon>("Weapon").to(Katana);

        let tryWeapon = () => { container.get("Ninja"); };

        expect(tryWeapon).to.throw(`${ERROR_MSGS.NOT_REGISTERED} Ninja`);

    });

    it("Should contain the provided name in error message when target is named", () => {

        let container = new Container();
        let tryGetNamedWeapon = (name: string|number|symbol) => { container.getNamed("Weapon", name); };

        expect(() => tryGetNamedWeapon("superior")).to.throw(/.*\bWeapon\b.*\bsuperior\b/g);
        expect(() => tryGetNamedWeapon(Symbol("Superior"))).to.throw(/.*\bWeapon\b.*Symbol\(Superior\)/g);
        expect(() => tryGetNamedWeapon(0)).to.throw(/.*\bWeapon\b.*\b0\b/g);

    });


    it("Should contain the provided tag in error message when target is tagged", () => {

        let container = new Container();
        let tryGetTaggedWeapon = (tag: string|number|symbol) => { container.getTagged("Weapon", tag, true); };

        expect(() => tryGetTaggedWeapon("canShoot")).to.throw(/.*\bWeapon\b.*\bcanShoot\b.*\btrue\b/g);
        expect(() => tryGetTaggedWeapon(Symbol("Can shoot"))).to.throw(/.*\bWeapon\b.*Symbol\(Can shoot\).*\btrue\b/g);
        expect(() => tryGetTaggedWeapon(0)).to.throw(/.*\bWeapon\b.*\b0\b.*\btrue\b/g);

    });

    it("Should list all possible bindings in error message if no matching binding found", () => {

        let container = new Container();
        container.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("strong");
        container.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("canThrow", true);
        container.bind<Weapon>("Weapon").to(Bokken).whenTargetNamed("weak");

        try {
            container.getNamed("Weapon", "superior");
        } catch (error) {
            expect(error.message).to.match(/.*\bKatana\b.*\bnamed\b.*\bstrong\b/);
            expect(error.message).to.match(/.*\bBokken\b.*\bnamed\b.*\bweak\b/);
            expect(error.message).to.match(/.*\bShuriken\b.*\btagged\b.*\bcanThrow\b.*\btrue\b/);
        }
    });

    it("Should list all possible bindings in error message if ambiguous matching binding found", () => {

        let container = new Container();
        container.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("strong");
        container.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("canThrow", true);
        container.bind<Weapon>("Weapon").to(Bokken).whenTargetNamed("weak");

        try {
            container.get("Weapon");
        } catch (error) {
            expect(error.message).to.match(/.*\bKatana\b.*\bnamed\b.*\bstrong\b/);
            expect(error.message).to.match(/.*\bBokken\b.*\bnamed\b.*\bweak\b/);
            expect(error.message).to.match(/.*\bShuriken\b.*\btagged\b.*\bcanThrow\b.*\btrue\b/);
        }

    });

    it("Should display a error when injecting into an abstract class", () => {

        @injectable()
        class Soldier extends Stubs.BaseSoldier { }

        @injectable()
        class Archer extends Stubs.BaseSoldier { }

        @injectable()
        class Knight extends Stubs.BaseSoldier { }

        @injectable()
        class Sword implements Stubs.Weapon { }

        @injectable()
        class Bow implements Stubs.Weapon { }

        @injectable()
        class DefaultWeapon implements Stubs.Weapon { }

        let container = new Container();

        container.bind<Stubs.Weapon>("Weapon").to(DefaultWeapon).whenInjectedInto(Soldier);
        container.bind<Stubs.Weapon>("Weapon").to(Sword).whenInjectedInto(Knight);
        container.bind<Stubs.Weapon>("Weapon").to(Bow).whenInjectedInto(Archer);
        container.bind<Stubs.BaseSoldier>("BaseSoldier").to(Soldier).whenTargetNamed("default");
        container.bind<Stubs.BaseSoldier>("BaseSoldier").to(Knight).whenTargetNamed("knight");
        container.bind<Stubs.BaseSoldier>("BaseSoldier").to(Archer).whenTargetNamed("archer");

        let throw1 = () => { container.getNamed<Stubs.BaseSoldier>("BaseSoldier", "default"); };
        let throw2 = () => { container.getNamed<Stubs.BaseSoldier>("BaseSoldier", "knight"); };
        let throw3 = () => { container.getNamed<Stubs.BaseSoldier>("BaseSoldier", "archer"); };

        function getError(className: string) {
            return ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_1 + className + ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_2;
        }

        expect(throw1).to.throw(getError("Soldier"));
        expect(throw2).to.throw(getError("Knight"));
        expect(throw3).to.throw(getError("Archer"));

    });

});
