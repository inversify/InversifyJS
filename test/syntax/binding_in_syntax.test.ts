import { expect } from "chai";
import * as sinon from "sinon";
import { Binding } from "../../src/bindings/binding";
import { BindingScopeEnum } from "../../src/constants/literal_types";
import { interfaces } from "../../src/inversify";
import { BindingInSyntax } from "../../src/syntax/binding_in_syntax";

describe("BindingInSyntax", () => {

    it("Should be able to configure the scope of a binding and return BindingWhenOnUnbindRebind from the BindingSyntaxFactory", () => {

        interface Ninja {}
        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);

        const mockBindingWhenOnUnbindRebind = {} as any;
        const mockBindingSyntaxFactory: Pick<interfaces.BindingSyntaxFactory<Ninja>, "getBindingWhenOnUnbindRebind"> = {
            getBindingWhenOnUnbindRebind: sinon.stub().returns(mockBindingWhenOnUnbindRebind)
        };

        const bindingInSyntax = new BindingInSyntax<Ninja>(binding, mockBindingSyntaxFactory as any);

        //scope from constructor ( default scope)
        expect(binding.scope).eql(BindingScopeEnum.Transient);

        // singleton scope
        expect(bindingInSyntax.inSingletonScope()).equal(mockBindingWhenOnUnbindRebind);
        expect(binding.scope).eql(BindingScopeEnum.Singleton);

        //request scope
        expect(bindingInSyntax.inRequestScope()).equal(mockBindingWhenOnUnbindRebind);
        expect(binding.scope).eql(BindingScopeEnum.Request);

        // set transient scope explicitly
        expect(bindingInSyntax.inTransientScope()).equal(mockBindingWhenOnUnbindRebind);
        expect(binding.scope).eql(BindingScopeEnum.Transient);

    });

});
