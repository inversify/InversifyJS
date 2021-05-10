import { expect } from "chai";
import { andConstraint, notConstraint, orConstraint, typeConstraint } from "../../src/syntax/constraint_helpers";
import { Binding } from "../../src/bindings/binding";
import { Request } from "../../src/planning/request";

describe("BindingInSyntax", () => {

    it("Should be return false when a request object is not provided", () => {

        const result = typeConstraint("TYPE")(null);
        expect(result).to.eql(false);

    });
});

describe("typeConstraint", () => {
    abstract class Animal {}
    class Snake extends Animal {}

    class SneakySnake extends Snake {}

    class Monkey extends Animal {}

    function createParentRequest(parentType: any) {
        const parentBinding = new Binding("Not important", "Singleton");
        parentBinding.implementationType = parentType;
        return  new Request("", null as any, null, [parentBinding], null as any);
    }
    function expectWhenInjectedInto(
        parentType: any,
        whenInjectedInto: any,
        expectedOk: boolean) {
            expect(typeConstraint(whenInjectedInto)(createParentRequest(parentType))).to.equal(expectedOk);
    }
    it("should inject into Snake when constrain to Animal as - Snake is an Animal", () => {
        expectWhenInjectedInto(Snake, Animal, true);
    });

    it("should not inject into Snake when constrain to Monkey as  - Snake is not a Monkey", () => {
        expectWhenInjectedInto(Snake, Monkey, false);
    });

    it("should inject into Snake when constrain to Snake as - Snake is a Snake", () => {
        expectWhenInjectedInto(Snake, Snake, true);
    });

    it("should inject into SneakySnake when constrain to Snake as - SneakySnake is a Snake", () => {
        expectWhenInjectedInto(SneakySnake, Snake, true);
    });

    it("should not inject into Snake when constrain to SneakySnake as - Snake is not a SneakySnake", () => {
        expectWhenInjectedInto(Snake, SneakySnake, false);
    });

});

describe("Not/and/or", () => {
    describe("Not", () => {
        it("Should create a constraint that is the not of the provided constraint", () => {
            expect(notConstraint(() => false)(null)).eql(true);
            expect(notConstraint(() => true)(null)).eql(false);
        });
    });
    describe("And", () => {
        it("Should create a constraint that is true if all provided constraints return true", () => {
            expect(andConstraint(
                () => false,
                () => true)(null)).eql(false);
            expect(andConstraint(
                () => true,
                () => true)(null)).eql(true);
        });
    });
    describe("Or", () => {
        it("Should create a constraint that is true if all provided constraints return true", () => {
            expect(orConstraint(
                () => false,
                () => true)(null)).eql(true);
            expect(orConstraint(
                () => false,
                () => false)(null)).eql(false);
        });
    });
});
