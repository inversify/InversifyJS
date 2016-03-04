///<reference path="../../typings/browser.d.ts" />

import { expect } from "chai";
import { Binding } from "../../src/bindings/binding";
import BindingWhenSyntax from "../../src/syntax/binding_when_syntax";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

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

    it("Should be able to configure the constraints of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingWhenSyntax = new BindingWhenSyntax<INinja>(binding);

        let throwErroFunction = () => {
            bindingWhenSyntax.when((context) => { return true; });
        };

        expect(throwErroFunction).to.throw(`${ERROR_MSGS.NOT_IMPLEMENTED}`);
    });

});
