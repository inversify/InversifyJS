import { expect } from "chai";
import { Container, injectable, inject } from "../../src/inversify";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

describe("Node", () => {

    it("Should throw if circular dependencies found", () => {

        interface A {}
        interface B {}
        interface C {}
        interface D {}

        @injectable()
        class A implements A {
            public b: B;
            public c: C;
            public constructor(
                @inject("B")  b: B,
                @inject("C")  c: C
            ) {
                this.b = b;
                this.c = c;
            }
        }

        @injectable()
        class B implements B {}

        @injectable()
        class C implements C {
            public d: D;
            public constructor(@inject("D") d: D) {
                this.d = d;
            }
        }

        @injectable()
        class D implements D {
            public a: A;
            public constructor(@inject("A") a: A) {
                this.a = a;
            }
        }

        let container = new Container();
        container.bind<A>("A").to(A);
        container.bind<B>("B").to(B);
        container.bind<C>("C").to(C);
        container.bind<D>("D").to(D);

        function willThrow() {
            let a = container.get<A>("A");
            return a;
        }

        expect(willThrow).to.throw(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} A -> B -> C -> D -> A`);

    });

});
