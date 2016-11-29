import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { Binding } from "../../src/bindings/binding";
import { BindingInWhenOnSyntax } from "../../src/syntax/binding_in_when_on_syntax";
import { injectable } from "../../src/annotation/injectable";
import { BindingScopeEnum } from "../../src/constants/literal_types";
import * as sinon from "sinon";

describe("BindingInWhenOnSyntax", () => {

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
        let bindingInWhenOnSyntax = new BindingInWhenOnSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        let _bindingInWhenOnSyntax: any = bindingInWhenOnSyntax;

        expect(_bindingInWhenOnSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

    });

    it("Should provide access to BindingInSyntax methods", () => {

        interface Ninja {}
        let ninjaIdentifier = "Ninja";

        let binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        let bindingInWhenOnSyntax = new BindingInWhenOnSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        let _bindingInWhenOnSyntax: any = bindingInWhenOnSyntax;

        // stubs for BindingWhenSyntax methods
        let inSingletonScopeStub = sinon.stub(_bindingInWhenOnSyntax._bindingInSyntax, "inSingletonScope").returns(null);
        let inTransientScopeStub = sinon.stub(_bindingInWhenOnSyntax._bindingInSyntax, "inTransientScope").returns(null);

        // invoke BindingWhenOnSyntax methods
        bindingInWhenOnSyntax.inSingletonScope();
        bindingInWhenOnSyntax.inTransientScope();

        // assert invoked BindingWhenSyntax methods
        expect(inSingletonScopeStub.callCount).eql(1);
        expect(inTransientScopeStub.callCount).eql(1);

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
        let bindingInWhenOnSyntax = new BindingInWhenOnSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        let _bindingInWhenOnSyntax: any = bindingInWhenOnSyntax;

        // stubs for BindingWhenSyntax methods
        let whenStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, "when").returns(null);
        let whenTargetNamedStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, "whenTargetNamed").returns(null);
        let whenTargetTaggedStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, "whenTargetTagged").returns(null);
        let whenInjectedIntoStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, "whenInjectedInto").returns(null);
        let whenParentNamedStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, "whenParentNamed").returns(null);
        let whenParentTaggedStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, "whenParentTagged").returns(null);

        let whenAnyAncestorIsStub = sinon.stub(
            _bindingInWhenOnSyntax._bindingWhenSyntax, "whenAnyAncestorIs").returns(null);

        let whenNoAncestorIsStub = sinon.stub(
            _bindingInWhenOnSyntax._bindingWhenSyntax, "whenNoAncestorIs").returns(null);

        let whenNoAncestorNamedStub = sinon.stub(
            _bindingInWhenOnSyntax._bindingWhenSyntax, "whenNoAncestorNamed").returns(null);

        let whenAnyAncestorNamedStub = sinon.stub(
            _bindingInWhenOnSyntax._bindingWhenSyntax, "whenAnyAncestorNamed").returns(null);

        let whenNoAncestorTaggedStub = sinon.stub(
            _bindingInWhenOnSyntax._bindingWhenSyntax, "whenNoAncestorTagged").returns(null);

        let whenAnyAncestorTaggedStub = sinon.stub(
            _bindingInWhenOnSyntax._bindingWhenSyntax, "whenAnyAncestorTagged").returns(null);

        let whenAnyAncestorMatchesStub = sinon.stub(
            _bindingInWhenOnSyntax._bindingWhenSyntax, "whenAnyAncestorMatches").returns(null);

        let whenNoAncestorMatchesStub = sinon.stub(
            _bindingInWhenOnSyntax._bindingWhenSyntax, "whenNoAncestorMatches").returns(null);

        // invoke BindingWhenOnSyntax methods
        bindingInWhenOnSyntax.when((request: interfaces.Request) => { return true; });
        bindingInWhenOnSyntax.whenTargetNamed("test");
        bindingInWhenOnSyntax.whenTargetTagged("test", true);
        bindingInWhenOnSyntax.whenInjectedInto("armny");
        bindingInWhenOnSyntax.whenInjectedInto(Army);
        bindingInWhenOnSyntax.whenParentNamed("test");
        bindingInWhenOnSyntax.whenParentTagged("test", true);
        bindingInWhenOnSyntax.whenAnyAncestorIs(Army);
        bindingInWhenOnSyntax.whenNoAncestorIs(ZombieArmy);
        bindingInWhenOnSyntax.whenAnyAncestorNamed("test");
        bindingInWhenOnSyntax.whenAnyAncestorTagged("test", true);
        bindingInWhenOnSyntax.whenNoAncestorNamed("test");
        bindingInWhenOnSyntax.whenNoAncestorTagged("test", true);
        bindingInWhenOnSyntax.whenAnyAncestorMatches((request: interfaces.Request) => { return true; });
        bindingInWhenOnSyntax.whenNoAncestorMatches((request: interfaces.Request) => { return true; });

        // assert invoked BindingWhenSyntax methods
        expect(whenStub.callCount).eql(1);
        expect(whenTargetNamedStub.callCount).eql(1);
        expect(whenTargetTaggedStub.callCount).eql(1);
        expect(whenInjectedIntoStub.callCount).eql(2);
        expect(whenParentNamedStub.callCount).eql(1);
        expect(whenAnyAncestorIsStub.callCount).eql(1);
        expect(whenNoAncestorIsStub.callCount).eql(1);
        expect(whenParentTaggedStub.callCount).eql(1);
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
        let bindingInWhenOnSyntax = new BindingInWhenOnSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        let _bindingInWhenOnSyntax: any = bindingInWhenOnSyntax;

        // stubs for BindingWhenSyntax methods
        let onActivationStub = sinon.stub(_bindingInWhenOnSyntax._bindingOnSyntax, "onActivation").returns(null);

        // invoke BindingWhenOnSyntax methods
        bindingInWhenOnSyntax.onActivation((context: interfaces.Context, ninja: Ninja) => {
            // DO NOTHING
            return ninja;
        });

        // assert invoked BindingWhenSyntax methods
        expect(onActivationStub.callCount).eql(1);

    });

});
