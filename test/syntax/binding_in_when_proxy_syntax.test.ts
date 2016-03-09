///<reference path="../../typings/browser.d.ts" />

import { expect } from "chai";
import Binding from "../../src/bindings/binding";
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

    it("Should be able to configure the constraints of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInWhenProxySyntax = new BindingInWhenProxySyntax<INinja>(binding);

        bindingInWhenProxySyntax.when((request: IRequest) => {
            return request.target.name.equals("ninja");
        });

        expect(binding.constraint).not.to.eql(null);
    });

    it("Should be able to configure the proxyMaker of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInWhenProxySyntax = new BindingInWhenProxySyntax<INinja>(binding);

        bindingInWhenProxySyntax.proxy((ninja: INinja) => {
            let handler = {};
            return new Proxy<INinja>(ninja, handler);
        });

        expect(binding.proxyMaker).not.to.eql(null);

    });

});
