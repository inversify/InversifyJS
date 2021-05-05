import { expect } from "chai";
import sinon = require("sinon");
import { Binding } from "../../src/bindings/binding";
import { BindingScopeEnum } from "../../src/constants/literal_types";
import { BindingInSyntax } from "../../src/syntax/binding_in_syntax";

describe("BindingInSyntax", () => {

    it("Should set its own properties correctly", () => {

        interface Ninja {}
        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier);
        const bindingInSyntax = new BindingInSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        const _bindingInSyntax: any = bindingInSyntax;

        expect(_bindingInSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

    });

    it("Should be able to configure the scope of a binding", () => {

        interface Ninja {}
        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier);
        const bindingInSyntax = new BindingInSyntax<Ninja>(binding);
        const setScopeSpy = sinon.spy(binding.scopeManager,"setScope");
        const setCustomScopeSpy = sinon.spy(binding.scopeManager,"setCustomScope");

        // singleton scope
        bindingInSyntax.inSingletonScope();
        expect(setScopeSpy.calledWithExactly(BindingScopeEnum.Singleton)).to.equal(true);

        bindingInSyntax.inTransientScope();
        expect(setScopeSpy.calledWithExactly(BindingScopeEnum.Transient)).to.equal(true);

        bindingInSyntax.inRequestScope();
        expect(setScopeSpy.calledWithExactly(BindingScopeEnum.Request)).to.equal(true);

        bindingInSyntax.inRootRequestScope();
        expect(setScopeSpy.calledWithExactly(BindingScopeEnum.RootRequest)).to.equal(true);

        const customScope:any = {customScope:true};
        bindingInSyntax.inCustomScope(customScope);
        expect(setCustomScopeSpy.calledWithExactly(customScope)).to.equal(true);

    });

});
