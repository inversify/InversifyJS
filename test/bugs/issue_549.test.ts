import { expect } from "chai";
import { Container, injectable, inject } from "../../src/inversify";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

describe("issue 549", () => {

    it("Should throw if circular dependencies found with dynamics", () => {

        @injectable()
        class A {
            public b: B;
            public constructor(
                @inject("B")  b: B
            ) {
                this.b = b;
            }
        }

        @injectable()
        class B {
            public a: A;
            public constructor(
                @inject("A") a: A
            ) {
                this.a = a;
            }
        }

        let container = new Container({defaultScope: "Singleton"});
        container.bind(A).toSelf();
        container.bind(B).toSelf();
        container.bind("A").toDynamicValue(ctx =>
            ctx.container.get(A)
        );

        container.bind("B").toDynamicValue(ctx =>
            ctx.container.get(B)
        );

        function willThrow() {
            return container.get<A>("A");
        }

        const expectedError = ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY("toDynamicValue", "A");
        expect(willThrow).to.throw(expectedError);

    });

});
