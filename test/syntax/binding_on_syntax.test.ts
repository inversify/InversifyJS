import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { Binding } from "../../src/bindings/binding";
import { BindingOnSyntax } from "../../src/syntax/binding_on_syntax";
import { BindingScope } from "../../src/bindings/binding_scope";
import * as Proxy from "harmony-proxy";

describe("BindingOnSyntax", () => {

    it("Should set its own properties correctly", () => {

        interface Ninja {}
        let ninjaIdentifier = "Ninja";

        let binding = new Binding<Ninja>(ninjaIdentifier, BindingScope.Transient);
        let bindingOnSyntax = new BindingOnSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        let _bindingOnSyntax: any = bindingOnSyntax;

        expect(_bindingOnSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

    });

    it("Should be able to configure the activation handler of a binding", () => {

        interface Ninja {}
        let ninjaIdentifier = "Ninja";

        let binding = new Binding<Ninja>(ninjaIdentifier, BindingScope.Transient);
        let bindingOnSyntax = new BindingOnSyntax<Ninja>(binding);

        bindingOnSyntax.onActivation((context: interfaces.Context, ninja: Ninja) => {
            let handler = {};
            return new Proxy<Ninja>(ninja, handler);
        });

        expect(binding.onActivation).not.to.eql(null);

    });

});
