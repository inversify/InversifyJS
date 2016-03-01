///<reference path="../../typings/browser.d.ts" />

import { expect } from "chai";
import { Inject, decorate } from "../../src/inversify";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import * as ERRORS_MSGS from "../../src/constants/error_msgs";
import * as Stubs from "../utils/stubs";

describe("@Inject", () => {

    let WarriotWithoutInjections = Stubs.WarriotWithoutInjections;
    let Warrior = Stubs.Warrior;

    it("Should not generate metadata when not applied", () => {
        let metadata = Reflect.getMetadata(METADATA_KEY.INJECT, WarriotWithoutInjections);
        expect(metadata).to.be.undefined;
    });

    it("Should generate metadata if declared injections", () => {

        let metadata = Reflect.getMetadata(METADATA_KEY.INJECT, Warrior);
        expect(metadata).to.be.instanceof(Array);

        expect(metadata[0]).to.be.eql("IKatana");
        expect(metadata[1]).to.be.eql("IShuriken");
        expect(metadata[2]).to.be.undefined;
    });

    it("Should throw when applayed mutiple times", () => {

        class Test {}

        let useDecoratorMoreThanOnce = function() {
            decorate(Inject("IKatana", "IShuriken"), Test);
            decorate(Inject("IKatana", "IShuriken"), Test);
        };

        expect(useDecoratorMoreThanOnce).to.throw(ERRORS_MSGS.DUPLICATED_INJECT_DECORATOR);
    });

    it("Should be usable in VanillaJS applications", () => {

        let VanillaJSWarrior = (function () {
            function VanillaJSWarrior(primary, secondary) {
                // ...
            }
            return VanillaJSWarrior;
        })();

        decorate(Inject("IKatana", "IShuriken"), VanillaJSWarrior);

        let metadata = Reflect.getMetadata(METADATA_KEY.INJECT, VanillaJSWarrior);
        expect(metadata).to.be.instanceof(Array);
        expect(metadata[0]).to.be.eql("IKatana");
        expect(metadata[1]).to.be.eql("IShuriken");
        expect(metadata[2]).to.be.undefined;
    });

});
