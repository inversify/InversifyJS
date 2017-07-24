import { expect } from "chai";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import { postConstruct } from "../../src/annotation/post_construct";
import { Metadata } from "../../dts/planning/metadata";
import * as ERRORS_MSGS from "../../src/constants/error_msgs";
import { decorate } from "../../src/inversify";

describe("@postConstruct", () => {

    it("Should generate metadata for the decorated method", () => {
        class Katana {
            private useMessage: string;

            public use() {
                return "Used Katana!";
            }

            @postConstruct()
            public testMethod() {
                this.useMessage = "Used Katana!";
            }
        }
        let metadata: Metadata = Reflect.getMetadata(METADATA_KEY.POST_CONSTRUCT, Katana);
        expect(metadata.value).to.be.equal("testMethod");
    });

    it("Should throw when applied multiple times", () => {
        function setup() {
            class Katana {
                @postConstruct()
                public testMethod1() {/* ... */}

                @postConstruct()
                public testMethod2() {/* ... */}
            }
            Katana.toString();
        }
        expect(setup).to.throw(ERRORS_MSGS.MULTIPLE_POST_CONSTRUCT_METHODS);
    });

    it("Should be usable in VanillaJS applications", () => {

        let VanillaJSWarrior = function () {
                   // ...
        };
        VanillaJSWarrior.prototype.testMethod = function () {
            // ...
        };

        decorate(postConstruct(), VanillaJSWarrior.prototype, "testMethod");

        let metadata: Metadata = Reflect.getMetadata(METADATA_KEY.POST_CONSTRUCT, VanillaJSWarrior);
        expect(metadata.value).to.be.equal("testMethod");
    });

});
