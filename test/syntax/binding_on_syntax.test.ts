///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import Binding from "../../src/bindings/binding";
import BindingOnSyntax from "../../src/syntax/binding_on_syntax";
import * as Proxy from "harmony-proxy";

describe("BindingOnSyntax", () => {

    it("Should set its own properties correctly", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingOnSyntax = new BindingOnSyntax<INinja>(binding);

        // cast to any to be able to access private props
        let _bindingOnSyntax: any = bindingOnSyntax;

        expect(_bindingOnSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

    });

    it("Should be able to configure the activation handler of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingOnSyntax = new BindingOnSyntax<INinja>(binding);

        bindingOnSyntax.onActivation((context: IContext, ninja: INinja) => {
            let handler = {};
            return new Proxy<INinja>(ninja, handler);
        });

        expect(binding.onActivation).not.to.eql(null);

    });

});
