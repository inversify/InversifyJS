///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import Binding from "../../src/bindings/binding";
import BindingScope from "../../src/bindings/binding_scope";
import BindingInSyntax from "../../src/syntax/binding_in_syntax";

describe("BindingInSyntax", () => {

    it("Should set its own properties correctly", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInSyntax = new BindingInSyntax<INinja>(binding);

        // cast to any to be able to access private props
        let _bindingInSyntax: any = bindingInSyntax;

        expect(_bindingInSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

    });

    it("Should be able to configure the scope of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingInSyntax = new BindingInSyntax<INinja>(binding);

        // default scope is transient
        expect(binding.scope).eql(BindingScope.Transient);

        // singleton scope
        bindingInSyntax.inSingletonScope();
        expect(binding.scope).eql(BindingScope.Singleton);

    });

});
