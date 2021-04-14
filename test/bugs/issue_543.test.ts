import { expect } from "chai";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import { Container, inject, injectable } from "../../src/inversify";

describe("Issue 543", () => {

    it("Should throw correct circular dependency path", () => {

        const TYPE = {
            Child: Symbol.for("Child"),
            Child2: Symbol.for("Child2"),
            Circular: Symbol.for("Circular"),
            Irrelevant: Symbol.for("Irrelevant1"),
            Root: Symbol.for("Root")
        };

        @injectable()
        class Irrelevant {}

        @injectable()
        class Child2 {
            public circ: unknown;
            public constructor(
                @inject(TYPE.Circular) circ: unknown
            ) {
                this.circ = circ;
            }
        }

        @injectable()
        class Child {
            public irrelevant: unknown;
            public child2: unknown;
            public constructor(
                @inject(TYPE.Irrelevant) irrelevant: unknown,
                @inject(TYPE.Child2) child2: unknown
            ) {
                this.irrelevant = irrelevant;
                this.child2 = child2;
            }
        }

        @injectable()
        class Circular {
            public irrelevant: unknown;
            public child: unknown;
            public constructor(
                @inject(TYPE.Irrelevant) irrelevant: unknown,
                @inject(TYPE.Child) child: unknown
            ) {
                this.irrelevant = irrelevant;
                this.child = child;
            }
        }

        @injectable()
        class Root {
            public irrelevant: unknown;
            public circ: unknown;
            public constructor(
                @inject(TYPE.Irrelevant) irrelevant1: unknown,
                @inject(TYPE.Circular) circ: unknown
            ) {
                this.irrelevant = irrelevant1;
                this.circ = circ;
            }
        }

        const container = new Container();
        container.bind<Root>(TYPE.Root).to(Root);
        container.bind<Irrelevant>(TYPE.Irrelevant).to(Irrelevant);
        container.bind<Circular>(TYPE.Circular).to(Circular);
        container.bind<Child>(TYPE.Child).to(Child);
        container.bind<Child2>(TYPE.Child2).to(Child2);

        function throws() {
            return container.get(TYPE.Root);
        }

        expect(throws).to.throw(
            `${ERROR_MSGS.CIRCULAR_DEPENDENCY} Symbol(Root) --> Symbol(Circular) --> Symbol(Child) --> Symbol(Child2) --> Symbol(Circular)`
        );

    });

});
