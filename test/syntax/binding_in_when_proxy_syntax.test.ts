///<reference path="../../typings/browser.d.ts" />

import { expect } from "chai";
import Binding from "../../src/bindings/binding";
import Request from "../../src/planning/request";
import Target from "../../src/planning/target";
import Metadata from "../../src/activation/metadata";
import BindingScope from "../../src/bindings/binding_scope";
import BindingInWhenProxySyntax from "../../src/syntax/binding_in_when_proxy_syntax";

describe("BindingInWhenProxySyntax", () => {

    it("Should set its own properties correctly", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInSyntax = new BindingInWhenProxySyntax<INinja>(binding);

        // cast to any to be able to access private props
        let _bindingInSyntax: any = bindingInSyntax;

        expect(_bindingInSyntax._binding.runtimeIdentifier).eql(ninjaIdentifier);

    });

    it("Should be able to configure the scope of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInWhenProxySyntax = new BindingInWhenProxySyntax<INinja>(binding);

        bindingInWhenProxySyntax.inSingletonScope();
        expect(binding.scope).eql(BindingScope.Singleton);

        bindingInWhenProxySyntax.inTransientScope();
        expect(binding.scope).eql(BindingScope.Transient);

    });

    it("Should be able to configure custom constraints of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInWhenProxySyntax = new BindingInWhenProxySyntax<INinja>(binding);

        bindingInWhenProxySyntax.when((request: IRequest) => {
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
        let bindingInWhenProxySyntax = new BindingInWhenProxySyntax<INinja>(binding);

        let named = "primary";

        bindingInWhenProxySyntax.whenTargetNamed(named);
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
        let bindingInWhenProxySyntax = new BindingInWhenProxySyntax<INinja>(binding);

        bindingInWhenProxySyntax.whenTargetTagged("canSwim", true);
        expect(binding.constraint).not.to.eql(null);

        let target = new Target("ninja", ninjaIdentifier, new Metadata("canSwim", true));
        let request = new Request(ninjaIdentifier, null, null, binding, target);
        expect(binding.constraint(request)).eql(true);

        let target2 = new Target("ninja", ninjaIdentifier, new Metadata("canSwim", false));
        let request2 = new Request(ninjaIdentifier, null, null, binding, target2);
        expect(binding.constraint(request2)).eql(false);

    });

    it("Should be able to configure the proxyMaker of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInWhenProxySyntax = new BindingInWhenProxySyntax<INinja>(binding);

        bindingInWhenProxySyntax.proxy((ninja: INinja) => {
            // let handler = {};
            // return new Proxy<INinja>(ninja, handler);
            // BLOCK http://stackoverflow.com/questions/35906938/how-to-enable-harmony-proxies-in-gulp-mocha
            return ninja;
        });

        expect(binding.proxyMaker).not.to.eql(null);

    });

});
