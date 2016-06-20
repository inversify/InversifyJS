import { expect } from "chai";
import { injectable, decorate } from "../../src/inversify";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import * as ERRORS_MSGS from "../../src/constants/error_msgs";

describe("@injectable", () => {

    it("Should generate metadata if declared injections", () => {

        class Katana {}

        interface Weapon {}

        @injectable()
        class Warrior {

            private _primaryWeapon: Katana;
            private _secondaryWeapon: Weapon;

            public constructor(primaryWeapon: Katana, secondaryWeapon: Weapon) {
                this._primaryWeapon = primaryWeapon;
                this._secondaryWeapon = secondaryWeapon;
            }

        }

        let metadata = Reflect.getMetadata(METADATA_KEY.PARAM_TYPES, Warrior);
        expect(metadata).to.be.instanceof(Array);

        expect(metadata[0]).to.be.eql(Katana);
        expect(metadata[1]).to.be.eql(Object);
        expect(metadata[2]).to.be.undefined;
    });

    it("Should throw when applayed mutiple times", () => {

        @injectable()
        class Test {}

        let useDecoratorMoreThanOnce = function() {
            decorate(injectable(), Test);
            decorate(injectable(), Test);
        };

        expect(useDecoratorMoreThanOnce).to.throw(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
    });

    it("Should be usable in VanillaJS applications", () => {

        interface Katana {}
        interface Shuriken {}

        let VanillaJSWarrior = (function () {
            function VanillaJSWarrior(primary: Katana, secondary: Shuriken) {
                // ...
            }
            return VanillaJSWarrior;
        })();

        decorate(injectable(), VanillaJSWarrior);

        let metadata = Reflect.getMetadata(METADATA_KEY.PARAM_TYPES, VanillaJSWarrior);
        expect(metadata).to.be.instanceof(Array);
        expect(metadata.length).to.eql(0);

    });

});
