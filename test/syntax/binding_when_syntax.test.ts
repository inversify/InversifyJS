///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import Binding from "../../src/bindings/binding";
import Request from "../../src/planning/request";
import Target from "../../src/planning/target";
import Metadata from "../../src/planning/metadata";
import BindingWhenSyntax from "../../src/syntax/binding_when_syntax";

describe("BindingWhenSyntax", () => {

    it("Should set its own properties correctly", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingWhenSyntax = new BindingWhenSyntax<INinja>(binding);

        // cast to any to be able to access private props
        let _bindingWhenSyntax: any = bindingWhenSyntax;

        expect(_bindingWhenSyntax._binding.runtimeIdentifier).eql(ninjaIdentifier);

    });

    it("Should be able to configure custom constraints of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingWhenSyntax = new BindingWhenSyntax<INinja>(binding);

        bindingWhenSyntax.when((request: IRequest) => {
            return request.target.name.equals("ninja");
        });

        let target = new Target("ninja", ninjaIdentifier);
        let request = new Request(ninjaIdentifier, null, null, binding, target);
        expect(binding.constraint(request)).eql(true);

    });

    it("Should be able to constraints a binding to a named target", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingWhenSyntax = new BindingWhenSyntax<INinja>(binding);

        let named = "primary";

        bindingWhenSyntax.whenTargetNamed(named);
        expect(binding.constraint).not.to.eql(null);

        let target = new Target("ninja", ninjaIdentifier, named);
        let request = new Request(ninjaIdentifier, null, null, binding, target);
        expect(binding.constraint(request)).eql(true);

        let target2 = new Target("ninja", ninjaIdentifier);
        let request2 = new Request(ninjaIdentifier, null, null, binding, target2);
        expect(binding.constraint(request2)).eql(false);

    });

    it("Should be able to constraints a binding to a tagged target", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingWhenSyntax = new BindingWhenSyntax<INinja>(binding);

        bindingWhenSyntax.whenTargetTagged("canSwim", true);
        expect(binding.constraint).not.to.eql(null);

        let target = new Target("ninja", ninjaIdentifier, new Metadata("canSwim", true));
        let request = new Request(ninjaIdentifier, null, null, binding, target);
        expect(binding.constraint(request)).eql(true);

        let target2 = new Target("ninja", ninjaIdentifier, new Metadata("canSwim", false));
        let request2 = new Request(ninjaIdentifier, null, null, binding, target2);
        expect(binding.constraint(request2)).eql(false);

    });

    it("Should be able to constraints a binding to a parent");
    it("Should be able to constraints a binding to a named parent");
    it("Should be able to constraints a binding to a tagged parent");
    it("Should be able to constraints a binding to ANY named ancestor");
    it("Should be able to constraints a binding to ANY tagged ancestor");
    it("Should be able to constraints a binding to NO named ancestor");
    it("Should be able to constraints a binding to NO tagged ancestor");
    it("Should be able to apply a custom constraints to ANY named ancestor");
    it("Should be able to apply a custom constraints to NO named ancestor");

});
