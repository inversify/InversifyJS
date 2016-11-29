import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { Binding } from "../../src/bindings/binding";
import { BindingWhenOnSyntax } from "../../src/syntax/binding_when_on_syntax";
import { injectable } from "../../src/annotation/injectable";
import { BindingScopeEnum } from "../../src/constants/literal_types";
import * as sinon from "sinon";

describe("BindingWhenOnSyntax", () => {

    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("Should set its own properties correctly", () => {

        interface Ninja {}
        let ninjaIdentifier = "Ninja";

        let binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        let bindingWhenOnSyntax = new BindingWhenOnSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        let _bindingWhenOnSyntax: any = bindingWhenOnSyntax;

        expect(_bindingWhenOnSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

    });

    it("Should provide access to BindingWhenSyntax methods", () => {

        interface Army {}

        @injectable()
        class Army implements Army {}

        interface ZombieArmy {}

        @injectable()
        class ZombieArmy implements ZombieArmy {}

        interface Ninja {}
        let ninjaIdentifier = "Ninja";

        let binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        let bindingWhenOnSyntax = new BindingWhenOnSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        let _bindingWhenOnSyntax: any = bindingWhenOnSyntax;

        // stubs for BindingWhenSyntax methods
        let whenStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, "when").returns(null);
        let whenTargetNamedStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, "whenTargetNamed").returns(null);
        let whenTargetTaggedStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, "whenTargetTagged").returns(null);
        let whenInjectedIntoStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, "whenInjectedInto").returns(null);
        let whenParentNamedStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, "whenParentNamed").returns(null);
        let whenParentTaggedStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, "whenParentTagged").returns(null);

        let whenAnyAncestorIsStub = sinon.stub(
            _bindingWhenOnSyntax._bindingWhenSyntax, "whenAnyAncestorIs").returns(null);

        let whenNoAncestorIsStub = sinon.stub(
            _bindingWhenOnSyntax._bindingWhenSyntax, "whenNoAncestorIs").returns(null);

        let whenAnyAncestorNamedStub = sinon.stub(
            _bindingWhenOnSyntax._bindingWhenSyntax, "whenAnyAncestorNamed").returns(null);

        let whenNoAncestorNamedStub = sinon.stub(
            _bindingWhenOnSyntax._bindingWhenSyntax, "whenNoAncestorNamed").returns(null);

        let whenNoAncestorTaggedStub = sinon.stub(
            _bindingWhenOnSyntax._bindingWhenSyntax, "whenNoAncestorTagged").returns(null);

        let whenAnyAncestorTaggedStub = sinon.stub(
            _bindingWhenOnSyntax._bindingWhenSyntax, "whenAnyAncestorTagged").returns(null);

        let whenAnyAncestorMatchesStub = sinon.stub(
            _bindingWhenOnSyntax._bindingWhenSyntax, "whenAnyAncestorMatches").returns(null);

        let whenNoAncestorMatchesStub = sinon.stub(
            _bindingWhenOnSyntax._bindingWhenSyntax, "whenNoAncestorMatches").returns(null);

        // invoke BindingWhenOnSyntax methods
        bindingWhenOnSyntax.when((request: interfaces.Request) => { return true; });
        bindingWhenOnSyntax.whenTargetNamed("test");
        bindingWhenOnSyntax.whenTargetTagged("test", true);
        bindingWhenOnSyntax.whenInjectedInto("armny");
        bindingWhenOnSyntax.whenInjectedInto(Army);
        bindingWhenOnSyntax.whenParentNamed("test");
        bindingWhenOnSyntax.whenParentTagged("test", true);
        bindingWhenOnSyntax.whenAnyAncestorIs(Army);
        bindingWhenOnSyntax.whenNoAncestorIs(ZombieArmy);
        bindingWhenOnSyntax.whenAnyAncestorNamed("test");
        bindingWhenOnSyntax.whenAnyAncestorTagged("test", true);
        bindingWhenOnSyntax.whenNoAncestorNamed("test");
        bindingWhenOnSyntax.whenNoAncestorTagged("test", true);
        bindingWhenOnSyntax.whenAnyAncestorMatches((request: interfaces.Request) => { return true; });
        bindingWhenOnSyntax.whenNoAncestorMatches((request: interfaces.Request) => { return true; });

        // assert invoked BindingWhenSyntax methods
        expect(whenStub.callCount).eql(1);
        expect(whenTargetNamedStub.callCount).eql(1);
        expect(whenTargetTaggedStub.callCount).eql(1);
        expect(whenInjectedIntoStub.callCount).eql(2);
        expect(whenParentNamedStub.callCount).eql(1);
        expect(whenParentTaggedStub.callCount).eql(1);
        expect(whenAnyAncestorIsStub.callCount).eql(1);
        expect(whenNoAncestorIsStub.callCount).eql(1);
        expect(whenAnyAncestorNamedStub.callCount).eql(1);
        expect(whenAnyAncestorTaggedStub.callCount).eql(1);
        expect(whenNoAncestorNamedStub.callCount).eql(1);
        expect(whenNoAncestorTaggedStub.callCount).eql(1);
        expect(whenAnyAncestorMatchesStub.callCount).eql(1);
        expect(whenNoAncestorMatchesStub.callCount).eql(1);

    });

    it("Should provide access to BindingOnSyntax methods", () => {

        interface Ninja {}
        let ninjaIdentifier = "Ninja";

        let binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        let bindingWhenOnSyntax = new BindingWhenOnSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        let _bindingWhenOnSyntax: any = bindingWhenOnSyntax;

        // stubs for BindingWhenSyntax methods
        let onActivationStub = sinon.stub(_bindingWhenOnSyntax._bindingOnSyntax, "onActivation").returns(null);

        // invoke BindingWhenOnSyntax methods
        bindingWhenOnSyntax.onActivation((context: interfaces.Context, ninja: Ninja) => {
            // DO NOTHING
            return ninja;
        });

        // assert invoked BindingWhenSyntax methods
        expect(onActivationStub.callCount).eql(1);

    });

});
