///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import Binding from "../../src/bindings/binding";
import Request from "../../src/planning/request";
import Target from "../../src/planning/target";
import Metadata from "../../src/planning/metadata";
import BindingScope from "../../src/bindings/binding_scope";
import BindingInWhenOnSyntax from "../../src/syntax/binding_in_when_on_syntax";
import * as Proxy from "harmony-proxy";

describe("BindingInWhenOnSyntax", () => {

    it("Should set its own properties correctly", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInWhenOnSyntax = new BindingInWhenOnSyntax<INinja>(binding);

        // cast to any to be able to access private props
        let _bindingInWhenOnSyntax: any = bindingInWhenOnSyntax;

        expect(_bindingInWhenOnSyntax._binding.runtimeIdentifier).eql(ninjaIdentifier);

    });

    it("Should be able to configure the scope of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInWhenOnSyntax = new BindingInWhenOnSyntax<INinja>(binding);

        bindingInWhenOnSyntax.inSingletonScope();
        expect(binding.scope).eql(BindingScope.Singleton);

        bindingInWhenOnSyntax.inTransientScope();
        expect(binding.scope).eql(BindingScope.Transient);

    });

    it("Should be able to configure custom constraints of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInWhenOnSyntax = new BindingInWhenOnSyntax<INinja>(binding);

        bindingInWhenOnSyntax.when((request: IRequest) => {
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
        let bindingInWhenOnSyntax = new BindingInWhenOnSyntax<INinja>(binding);

        let named = "primary";

        bindingInWhenOnSyntax.whenTargetNamed(named);
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
        let bindingInWhenOnSyntax = new BindingInWhenOnSyntax<INinja>(binding);

        bindingInWhenOnSyntax.whenTargetTagged("canSwim", true);
        expect(binding.constraint).not.to.eql(null);

        let target = new Target("ninja", ninjaIdentifier, new Metadata("canSwim", true));
        let request = new Request(ninjaIdentifier, null, null, binding, target);
        expect(binding.constraint(request)).eql(true);

        let target2 = new Target("ninja", ninjaIdentifier, new Metadata("canSwim", false));
        let request2 = new Request(ninjaIdentifier, null, null, binding, target2);
        expect(binding.constraint(request2)).eql(false);

    });

    it("Should be able to configure the activation handler of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInWhenOnSyntax = new BindingInWhenOnSyntax<INinja>(binding);

        bindingInWhenOnSyntax.onActivation((ninja: INinja) => {
            let handler = {};
            return new Proxy<INinja>(ninja, handler);
        });

        expect(binding.onActivation).not.to.eql(null);

    });

});
