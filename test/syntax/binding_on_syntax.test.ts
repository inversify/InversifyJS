import { expect } from "chai";
import * as Proxy from "harmony-proxy";
import * as sinon from "sinon";
import { Binding } from "../../src/bindings/binding";
import { BindingScopeEnum } from "../../src/constants/literal_types";
import { interfaces } from "../../src/interfaces/interfaces";
import { BindingOnSyntax } from "../../src/syntax/binding_on_syntax";

describe("BindingOnSyntax", () => {

    it("Should be able to configure the activation handler of a binding and return BindingWhen from the BindingSyntaxFactory", () => {

        interface Ninja {}
        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);

        const mockBindingWhenUnbindRebind = {} as any;
        const mockBindingSyntaxFactory: Pick<interfaces.BindingSyntaxFactory<Ninja>, "getBindingWhenUnbindRebind"> = {
            getBindingWhenUnbindRebind: sinon.stub().returns(mockBindingWhenUnbindRebind)
        };

        const bindingOnSyntax = new BindingOnSyntax<Ninja>(binding, mockBindingSyntaxFactory as any);

        const onActivation = (context: interfaces.Context, ninja: Ninja) => {
            const handler = {};
            return new Proxy<Ninja>(ninja, handler);
        };
        expect(bindingOnSyntax.onActivation(onActivation)).equal(mockBindingWhenUnbindRebind);

        expect(binding.onActivation).equal(onActivation);

    });

});
