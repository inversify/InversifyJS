import { expect } from "chai";
import * as sinon from "sinon";
import { injectable } from "../../src/annotation/injectable";
import { interfaces } from "../../src/interfaces/interfaces";

export function unbindRebindPassthrough(
    create: (bindingSyntaxFactory: any) => interfaces.BindingUnbindRebindSyntax<any>) {
    it("Should provide access to BindingUnbindRebindSyntax unbind", () => {
        const mockBindingUnbindRebind: {
            [P in keyof interfaces.BindingUnbindRebindSyntax<any>]: sinon.SinonStub
        } = {
            rebind: sinon.stub(),
            unbind: sinon.stub()
        };
        const mockBindingSyntaxFactory: Pick<interfaces.BindingSyntaxFactory<any>,
        |"getUnbindRebind"> = {
            getUnbindRebind: () => mockBindingUnbindRebind
        };
        const passThrough = create(mockBindingSyntaxFactory);
        passThrough.unbind();
        sinon.assert.called(mockBindingUnbindRebind.unbind);
    });
    it("Should provide access to BindingUnbindRebindSyntax rebind", () => {
        const mockBindingUnbindRebind: {
            [P in keyof interfaces.BindingUnbindRebindSyntax<any>]: sinon.SinonStub
        } = {
            rebind: sinon.stub(),
            unbind: sinon.stub()
        };
        const mockBindingSyntaxFactory: Pick<interfaces.BindingSyntaxFactory<any>,
        |"getUnbindRebind"> = {
            getUnbindRebind: () => mockBindingUnbindRebind
        };
        const passThrough = create(mockBindingSyntaxFactory);
        passThrough.rebind();
        sinon.assert.called(mockBindingUnbindRebind.rebind);
    });
}
export function whenPassthrough(
    create: (bindingSyntaxFactory: any) => interfaces.BindingWhenSyntax<any>) {
    it("Should provide access to BindingWhenSyntax methods", () => {
        const mockBindingOnUnbindRebindReturn = {} as any;
        const mockBindingWhen: {
            [P in keyof interfaces.BindingWhenSyntax<any>]: sinon.SinonStub
        } = {
            when: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenAnyAncestorIs: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenAnyAncestorMatches: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenAnyAncestorNamed: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenAnyAncestorTagged: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenInjectedInto: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenNoAncestorIs: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenNoAncestorMatches: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenNoAncestorNamed: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenNoAncestorTagged: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenParentNamed: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenParentTagged: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenTargetIsDefault: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenTargetNamed: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
            whenTargetTagged: sinon.stub().returns(mockBindingOnUnbindRebindReturn),
        };
        const mockBindingSyntaxFactory: Pick<interfaces.BindingSyntaxFactory<any>,
        |"getBindingWhen"> = {
            getBindingWhen: () => mockBindingWhen
        };
        const passThrough = create(mockBindingSyntaxFactory);

        interface Army {}

        @injectable()
        class Army implements Army {}

        interface ZombieArmy {}

        @injectable()
        class ZombieArmy implements ZombieArmy {}

        // invoke pass through methods
        const whenArg = (request: interfaces.Request) => true;
        expect(passThrough.when(whenArg)).equal(mockBindingOnUnbindRebindReturn);
        expect(passThrough.whenTargetNamed("test")).equal(mockBindingOnUnbindRebindReturn);
        expect(passThrough.whenTargetTagged("test", true)).equal(mockBindingOnUnbindRebindReturn);
        expect(passThrough.whenInjectedInto(Army)).equal(mockBindingOnUnbindRebindReturn);
        expect(passThrough.whenParentNamed("test")).equal(mockBindingOnUnbindRebindReturn);
        expect(passThrough.whenParentTagged("test", true)).equal(mockBindingOnUnbindRebindReturn);
        expect(passThrough.whenAnyAncestorIs(Army)).equal(mockBindingOnUnbindRebindReturn);
        expect(passThrough.whenNoAncestorIs(ZombieArmy)).equal(mockBindingOnUnbindRebindReturn);
        expect(passThrough.whenAnyAncestorNamed("test")).equal(mockBindingOnUnbindRebindReturn);
        expect(passThrough.whenAnyAncestorTagged("test", true)).equal(mockBindingOnUnbindRebindReturn);
        expect(passThrough.whenNoAncestorNamed("test")).equal(mockBindingOnUnbindRebindReturn);
        expect(passThrough.whenNoAncestorTagged("test", true)).equal(mockBindingOnUnbindRebindReturn);
        const whenAnyAncestorMatchesArg = (request: interfaces.Request) => true;
        expect(passThrough.whenAnyAncestorMatches(whenAnyAncestorMatchesArg)).equal(mockBindingOnUnbindRebindReturn);
        const whenNoAncestorMatchesArg = (request: interfaces.Request) => true;
        expect(passThrough.whenNoAncestorMatches(whenNoAncestorMatchesArg)).equal(mockBindingOnUnbindRebindReturn);

        //assert calls BindingWhenSyntax methods
        sinon.assert.calledWithExactly(mockBindingWhen.when, whenArg);
        sinon.assert.calledWithExactly(mockBindingWhen.whenTargetNamed, "test");
        sinon.assert.calledWithExactly(mockBindingWhen.whenTargetTagged, "test", true);
        sinon.assert.calledWithExactly(mockBindingWhen.whenInjectedInto, Army);
        sinon.assert.calledWithExactly(mockBindingWhen.whenParentNamed, "test");
        sinon.assert.calledWithExactly(mockBindingWhen.whenParentTagged, "test", true);
        sinon.assert.calledWithExactly(mockBindingWhen.whenAnyAncestorIs, Army);
        sinon.assert.calledWithExactly(mockBindingWhen.whenNoAncestorIs, ZombieArmy);
        sinon.assert.calledWithExactly(mockBindingWhen.whenAnyAncestorNamed, "test");
        sinon.assert.calledWithExactly(mockBindingWhen.whenAnyAncestorTagged, "test", true);
        sinon.assert.calledWithExactly(mockBindingWhen.whenNoAncestorNamed, "test");
        sinon.assert.calledWithExactly(mockBindingWhen.whenNoAncestorTagged, "test", true);
        sinon.assert.calledWithExactly(mockBindingWhen.whenAnyAncestorMatches, whenAnyAncestorMatchesArg);
        sinon.assert.calledWithExactly(mockBindingWhen.whenNoAncestorMatches, whenNoAncestorMatchesArg);

    });
}
export function inPassthrough(
    create: (bindingSyntaxFactory: any) => interfaces.BindingInSyntax<any>) {
    it("Should provide access to BindingInSyntax methods", () => {
        const mockBindingWhenOnUnbindRebindReturn = {} as any;
        const mockBindingIn: {
            [P in keyof interfaces.BindingInSyntax<any>]: sinon.SinonStub
        } = {
            inRequestScope: sinon.stub().returns(mockBindingWhenOnUnbindRebindReturn),
            inSingletonScope: sinon.stub().returns(mockBindingWhenOnUnbindRebindReturn),
            inTransientScope: sinon.stub().returns(mockBindingWhenOnUnbindRebindReturn),
        };
        const mockBindingSyntaxFactory: Pick<interfaces.BindingSyntaxFactory<any>,
        |"getBindingIn"> = {
            getBindingIn: () => mockBindingIn
        };
        const passThrough = create(mockBindingSyntaxFactory);

        // invoke pass through methods
        expect(passThrough.inSingletonScope()).equal(mockBindingWhenOnUnbindRebindReturn);
        expect(passThrough.inTransientScope()).equal(mockBindingWhenOnUnbindRebindReturn);
        expect(passThrough.inRequestScope()).equal(mockBindingWhenOnUnbindRebindReturn);

        // assert invoked BindingInSyntax methods
        sinon.assert.called(mockBindingIn.inSingletonScope);
        sinon.assert.called(mockBindingIn.inTransientScope);
        sinon.assert.called(mockBindingIn.inRequestScope);
    });
}
export function onPassthrough(
    create: (bindingSyntaxFactory: any) => interfaces.BindingOnSyntax<any>) {
    it("Should provide access to BindingOnSyntax methods", () => {
        const mockBindingWhenUnbindRebindReturn = {} as any;
        const mockBindingOn: {
            [P in keyof interfaces.BindingOnSyntax<any>]: sinon.SinonStub
        } = {
            onActivation: sinon.stub().returns(mockBindingWhenUnbindRebindReturn),
        };
        const mockBindingSyntaxFactory: Pick<interfaces.BindingSyntaxFactory<any>,
        |"getBindingOn"> = {
            getBindingOn: () => mockBindingOn
        };
        const passThrough = create(mockBindingSyntaxFactory);

        const onActivation = (context: interfaces.Context, injected: any) => injected;
        // invoke pass through method
        passThrough.onActivation(onActivation);

        // assert invoked BindingOnSyntax methods
        sinon.assert.calledWithExactly(mockBindingOn.onActivation, onActivation);
    });
}
