///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import { decorate } from "../../src/annotation/decorator_utils";
import paramName from "../../src/annotation/param_name";
import injectable from "../../src/annotation/injectable";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import * as ERRORS_MSGS from "../../src/constants/error_msgs";
import * as Stubs from "../utils/stubs";

describe("@paramName", () => {

    it("Should not generate metadata when not applied", () => {

        class Warrior {

            public katana: Stubs.IKatana;
            public shuriken: Stubs.IShuriken;

            constructor(katana: Stubs.IKatana, shuriken: Stubs.IShuriken) {

                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let metadata = Reflect.getMetadata(METADATA_KEY.TAGGED, Warrior);
        expect(metadata).to.be.undefined;
    });

    it("Should generate metadata if declared parameter names", () => {

        @injectable()
        class Warrior {

            public katana: Stubs.IKatana;
            public shuriken: Stubs.IShuriken;

            constructor(
                @paramName("katana") katana: Stubs.IKatana,
                @paramName("shuriken") shuriken: Stubs.IShuriken
            ) {

                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let metadata = Reflect.getMetadata(METADATA_KEY.TAGGED, Warrior);
        expect(metadata).to.be.instanceof(Array);

        expect(metadata[0]).to.be.eql("katana");
        expect(metadata[1]).to.be.eql("shuriken");
        expect(metadata[2]).to.be.undefined;
    });

    it("Should throw when applayed mutiple times", () => {

        class Warrior {

            public katana: Stubs.IKatana;
            public shuriken: Stubs.IShuriken;

            constructor(katana: Stubs.IKatana, shuriken: Stubs.IShuriken) {

                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let useDecoratorMoreThanOnce = function() {
            decorate(paramName("katana"), Warrior);
            decorate(paramName("shuriken"), Warrior);
        };

        expect(useDecoratorMoreThanOnce).to.throw(ERRORS_MSGS.DUPLICATED_PARAM_NAMES_DECORATOR);
    });

    it("Should be usable in VanillaJS applications", () => {

        interface IKatana {}
        interface IShurien {}

        let VanillaJSWarrior = (function () {
            function VanillaJSWarrior(primary: IKatana, secondary: IShurien) {
                // ...
            }
            return VanillaJSWarrior;
        })();

        decorate(paramName("katana"), VanillaJSWarrior);

        let metadata = Reflect.getMetadata(METADATA_KEY.TAGGED, VanillaJSWarrior);
        expect(metadata).to.be.instanceof(Array);

        expect(metadata[0]).to.be.eql("katana");
        expect(metadata[1]).to.be.eql("shuriken");
        expect(metadata[2]).to.be.undefined;
    });

});
