///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import { decorate } from "../../src/annotation/decorator_utils";
import paramName from "../../src/annotation/param_name";
import injectable from "../../src/annotation/injectable";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import * as Stubs from "../utils/stubs";

describe("@paramName", () => {

    it("Should not generate metadata when not applied", () => {

        @injectable()
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
        expect(metadata["0"]).to.be.instanceof(Array);
        expect(metadata["1"]).to.be.instanceof(Array);
        expect(metadata["2"]).to.eql(undefined);

        expect(metadata["0"][0].key).to.be.eql("name");
        expect(metadata["0"][0].value).to.be.eql("katana");
        expect(metadata["1"][0].key).to.be.eql("name");
        expect(metadata["1"][0].value).to.be.eql("shuriken");

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

        decorate(paramName("primary"), VanillaJSWarrior, 0);
        decorate(paramName("secondary"), VanillaJSWarrior, 1);

        let metadata = Reflect.getMetadata(METADATA_KEY.TAGGED, VanillaJSWarrior);
        expect(metadata["0"]).to.be.instanceof(Array);
        expect(metadata["1"]).to.be.instanceof(Array);
        expect(metadata["2"]).to.eql(undefined);

        expect(metadata["0"][0].key).to.be.eql("name");
        expect(metadata["0"][0].value).to.be.eql("primary");
        expect(metadata["1"][0].key).to.be.eql("name");
        expect(metadata["1"][0].value).to.be.eql("secondary");

    });

});
