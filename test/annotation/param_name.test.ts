///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import { decorate } from "../../src/annotation/decorator_utils";
import targetName from "../../src/annotation/param_name";
import injectable from "../../src/annotation/injectable";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import * as Stubs from "../utils/stubs";

describe("@targetName", () => {

    it("Should generate metadata if declared parameter names", () => {

        @injectable()
        class Warrior {

            public katana: Stubs.IKatana;
            public shuriken: Stubs.IShuriken;

            constructor(
                @targetName("katana") katana: Stubs.IKatana,
                @targetName("shuriken") shuriken: Stubs.IShuriken
            ) {

                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let metadata = Reflect.getMetadata(METADATA_KEY.TAGGED, Warrior);
        expect(metadata["0"]).to.be.instanceof(Array);
        expect(metadata["1"]).to.be.instanceof(Array);
        expect(metadata["2"]).to.eql(undefined);

        expect(metadata["0"][0].key).to.be.eql(METADATA_KEY.NAME_TAG);
        expect(metadata["0"][0].value).to.be.eql("katana");
        expect(metadata["1"][0].key).to.be.eql(METADATA_KEY.NAME_TAG);
        expect(metadata["1"][0].value).to.be.eql("shuriken");

    });

    it("Should generate metadata if declared property names", () => {

        interface IWeapon {}

        class Warrior {
            @targetName("weapon")
            public weapon: IWeapon;
        }

        let metadataKey = METADATA_KEY.TAGGED_PROP;
        let metadata: any = Reflect.getMetadata(metadataKey, Warrior);

        let m1 = metadata.weapon[0];
        expect(m1.key).to.be.eql(METADATA_KEY.NAME_TAG);
        expect(m1.value).to.be.eql("weapon");
        expect(metadata.weapon[1]).to.be.undefined;

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

        decorate(targetName("primary"), VanillaJSWarrior, 0);
        decorate(targetName("secondary"), VanillaJSWarrior, 1);

        let metadata = Reflect.getMetadata(METADATA_KEY.TAGGED, VanillaJSWarrior);
        expect(metadata["0"]).to.be.instanceof(Array);
        expect(metadata["1"]).to.be.instanceof(Array);
        expect(metadata["2"]).to.eql(undefined);

        expect(metadata["0"][0].key).to.be.eql(METADATA_KEY.NAME_TAG);
        expect(metadata["0"][0].value).to.be.eql("primary");
        expect(metadata["1"][0].key).to.be.eql(METADATA_KEY.NAME_TAG);
        expect(metadata["1"][0].value).to.be.eql("secondary");

    });

});
