import { expect } from "chai";
import { Container, injectable, MetadataReader, TargetTypeEnum } from "../../src/inversify";
import { plan } from "../../src/planning/planner";
import { multiTaggedConstraint, typeConstraint } from "../../src/syntax/constraint_helpers";

describe("BindingInSyntax", () => {

    it("Should be return false when a request object is not provided", () => {

        const result = typeConstraint("TYPE")(null);
        expect(result).to.eql(false);

    });

    describe("multiTaggedConstraint", () => {

        interface Weapon {
            use(): string;
        }

        @injectable()
        class Katana implements Weapon {
            public use() {
                return "katana!";
            }
        }

        @injectable()
        class Shuriken implements Weapon {
            constructor(private readonly spikes: number) { }
            public use() {
                return `${this.spikes} spikes shuriken!`;
            }
        }

        const container = new Container();
        container.bind<Weapon>("Weapon").toConstantValue(new Shuriken(3))
            .whenTargetMultiTagged(['throwable', true], ["spikes", 3]);
        container.bind<Weapon>("Weapon").toConstantValue(new Shuriken(4))
            .whenTargetMultiTagged(['throwable', true], ["spikes", 4]);
        container.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("throwable", false);

        it("should return true when all tags are present", () => {
            const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable,
                "Weapon", [["throwable", false], ["spikes", 4]])

            const constraint = multiTaggedConstraint(["throwable", false], ["spikes", 4]);
            const constraintResult = constraint(context.plan.rootRequest)

            expect(constraintResult).to.equal(true)
        })

        it("should return false when a tag is not present", () => {
            const context = plan(new MetadataReader(), container, false, TargetTypeEnum.Variable,
                "Weapon", [["throwable", false], ["spikes", 5]])

            const constraint = multiTaggedConstraint(["throwable", false], ["spikes", 4]);
            const constraintResult = constraint(context.plan.rootRequest)

            expect(constraintResult).to.equal(false)
        })
    })
});
