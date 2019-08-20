import { expect } from "chai";
import * as sinon from "sinon";
import { Binding } from "../../src/bindings/binding";
import { BindingInSyntax } from "../../src/syntax/binding_in_syntax";
import { BindingInWhenOnUnbindRebindSyntax } from "../../src/syntax/binding_in_when_on_unbindrebind_syntax";
import { BindingOnSyntax } from "../../src/syntax/binding_on_syntax";
import { BindingOnUnbindRebindSyntax } from "../../src/syntax/binding_on_unbindrebind_syntax";
import { BindingToSyntax } from "../../src/syntax/binding_to_syntax";
import { BindingUnbindRebindSyntax } from "../../src/syntax/binding_unbindrebind_syntax";
import { BindingWhenOnUnbindRebindSyntax } from "../../src/syntax/binding_when_on_unbindrebind_syntax";
import { BindingWhenSyntax } from "../../src/syntax/binding_when_syntax";
import { BindingWhenUnbindRebindSyntax} from "../../src/syntax/binding_when_unbindrebind_syntax";
import { BindingSyntaxFactory } from "../../src/syntax/bindingSyntaxFactory";

describe("BindingSyntaxFactory", () => {
    it("create instances of Binding Syntax classes, passing itself as constructor argument and the Binding if required", () => {
        const binding = new Binding("Sid", "Request");
        const unbind = sinon.fake();
        const bind = sinon.fake();
        const bsf = new BindingSyntaxFactory(binding, unbind, bind);

        const bindingIn = bsf.getBindingIn() as any;
        expect(bindingIn).instanceOf(BindingInSyntax);

        const bindingOn = bsf.getBindingOn() as any;
        expect(bindingOn).instanceOf(BindingOnSyntax);

        const bindingTo = bsf.getBindingTo() as any;
        expect(bindingTo).instanceOf(BindingToSyntax);

        const bindingWhen = bsf.getBindingWhen() as any;
        expect(bindingWhen).instanceOf(BindingWhenSyntax);

        const bindingUnbindRebind = bsf.getUnbindRebind() as any;
        expect(bindingUnbindRebind).instanceOf(BindingUnbindRebindSyntax);

        const bindingInWhenOnUnbindRebind = bsf.getBindingInWhenOnUnbindRebind() as any;
        expect(bindingInWhenOnUnbindRebind).instanceOf(BindingInWhenOnUnbindRebindSyntax);

        const bindingWhenOnUnbindRebind = bsf.getBindingWhenOnUnbindRebind() as any;
        expect(bindingWhenOnUnbindRebind).instanceOf(BindingWhenOnUnbindRebindSyntax);

        const bindingWhenUnbindRebind = bsf.getBindingWhenUnbindRebind() as any;
        expect(bindingWhenUnbindRebind).instanceOf(BindingWhenUnbindRebindSyntax);

        const bindingOnUnbindRebind = bsf.getBindingOnUnbindRebind() as any;
        expect(bindingOnUnbindRebind).instanceOf(BindingOnUnbindRebindSyntax);

        const syntaxesWithBinding: any[] = [bindingIn, bindingOn, bindingTo, bindingWhen, bindingUnbindRebind];
        syntaxesWithBinding.forEach((b) => {
            expect(b._binding).equal(binding);
        });
        const syntaxesWithBindingSyntaxFactory =
        [bindingIn, bindingOn, bindingTo, bindingWhen, bindingInWhenOnUnbindRebind, bindingWhenOnUnbindRebind,
            bindingWhenUnbindRebind, bindingOnUnbindRebind];
        syntaxesWithBindingSyntaxFactory.forEach((b) => {
            expect(b._bindingSyntaxFactory).equal(bsf);
        });

        expect(bindingUnbindRebind._unbind).equal(unbind);
        expect(bindingUnbindRebind._bind).equal(bind);
    });
});
