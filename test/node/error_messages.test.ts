import { expect } from "chai";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
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
        let tryGetNamedWeapon = () => { container.getNamed("Weapon", "superior"); };

        expect(tryGetNamedWeapon).to.throw(/.*\bWeapon\b.*\bsuperior\b/g);

    });

    it("Should contain the provided tag in error message when target is tagged", () => {

        let container = new Container();
        let tryGetTaggedWeapon = () => { container.getTagged("Weapon", "canShoot", true); };

        expect(tryGetTaggedWeapon).to.throw(/.*\bWeapon\b.*\bcanShoot\b.*\btrue\b/g);

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

});
