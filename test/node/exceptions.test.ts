import { expect } from "chai";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import { Container, inject, injectable } from "../../src/inversify";

describe("Node", () => {

    it("Should throw if circular dependencies found", () => {

        interface A {}
        interface B {}
        interface C {}
        interface D {}

        @injectable()
        class A implements A {
            public b: unknown;
            public c: unknown;
            public constructor(
                @inject("B") b: unknown,
                @inject("C") c: unknown,
            ) {
                this.b = b;
                this.c = c;
            }
        }

        @injectable()
        class B implements B {}

        @injectable()
        class C implements C {
            public d: unknown;
            public constructor(@inject("D") d: unknown) {
                this.d = d;
            }
        }

        @injectable()
        class D implements D {
            public a: unknown;
            public constructor(@inject("A") a: unknown) {
                this.a = a;
            }
        }

        const container = new Container();
        container.bind<A>("A").to(A);
        container.bind<B>("B").to(B);
        container.bind<C>("C").to(C);
        container.bind<D>("D").to(D);

        function willThrow() {
            const a = container.get<A>("A");
            return a;
        }

        expect(willThrow).to.throw(
            `${ERROR_MSGS.CIRCULAR_DEPENDENCY} A --> C --> D --> A`
        );

    });

});
