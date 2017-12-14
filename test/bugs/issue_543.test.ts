import { expect } from "chai";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import { Container, inject, injectable } from "../../src/inversify";

describe("issue 543", () => {

    it("Should throw if circular dependencies found with dynamics", () => {

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
            public circ: Circular;
            public constructor(
                @inject(TYPE.Circular) circ: Circular
            ) {
                this.circ = circ;
            }
        }

        @injectable()
        class Child {
            public irrelevant: Irrelevant;
            public child2: Child2;
            public constructor(
                @inject(TYPE.Irrelevant) irrelevant: Irrelevant,
                @inject(TYPE.Child2) child2: Child2
            ) {
                this.irrelevant = irrelevant;
                this.child2 = child2;
            }
        }

        @injectable()
        class Circular {
            public irrelevant: Irrelevant;
            public child: Child;
            public constructor(
                @inject(TYPE.Irrelevant) irrelevant: Irrelevant,
                @inject(TYPE.Child) child: Child
            ) {
                this.irrelevant = irrelevant;
                this.child = child;
            }
        }

        @injectable()
        class Root {
            public irrelevant: Irrelevant;
            public circ: Circular;
            public constructor(
                @inject(TYPE.Irrelevant) irrelevant1: Irrelevant,
                @inject(TYPE.Circular) circ: Circular
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
