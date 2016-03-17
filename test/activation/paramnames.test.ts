///<reference path="../../typings/browser.d.ts" />

import { expect } from "chai";
import { decorate } from "../../src/activation/decorator_utils";
import paramNames from "../../src/activation/paramnames";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import * as ERRORS_MSGS from "../../src/constants/error_msgs";
import * as Stubs from "../utils/stubs";

describe("@paramNames", () => {

    it("Should not generate metadata when not applied", () => {

        class Warrior {

            public katana: Stubs.IKatana;
            public shuriken: Stubs.IShuriken;

            constructor(katana: Stubs.IKatana, shuriken: Stubs.IShuriken) {

                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let metadata = Reflect.getMetadata(METADATA_KEY.PARAM_NAMES, Warrior);
        expect(metadata).to.be.undefined;
    });

    it("Should generate metadata if declared parameter names", () => {

        @paramNames("katana", "shuriken")
        class Warrior {

            public katana: Stubs.IKatana;
            public shuriken: Stubs.IShuriken;

            constructor(katana: Stubs.IKatana, shuriken: Stubs.IShuriken) {

                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let metadata = Reflect.getMetadata(METADATA_KEY.PARAM_NAMES, Warrior);
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
            decorate(paramNames("katana", "shuriken"), Warrior);
            decorate(paramNames("katana", "shuriken"), Warrior);
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

        decorate(paramNames("katana", "shuriken"), VanillaJSWarrior);

        let metadata = Reflect.getMetadata(METADATA_KEY.PARAM_NAMES, VanillaJSWarrior);
        expect(metadata).to.be.instanceof(Array);

        expect(metadata[0]).to.be.eql("katana");
        expect(metadata[1]).to.be.eql("shuriken");
        expect(metadata[2]).to.be.undefined;
    });

});
