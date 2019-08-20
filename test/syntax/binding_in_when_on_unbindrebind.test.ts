import { BindingInWhenOnUnbindRebindSyntax } from "../../src/syntax/binding_in_when_on_unbindrebind_syntax";
import { inPassthrough, onPassthrough, unbindRebindPassthrough, whenPassthrough } from "./passThroughHelper";

describe("BindingInWhenOnUnbindRebindSyntax", () => {
    function create(bindingSyntaxFactory: any) {
        return new BindingInWhenOnUnbindRebindSyntax(bindingSyntaxFactory);
    }
    unbindRebindPassthrough(create);
    whenPassthrough(create);
    inPassthrough(create);
    onPassthrough(create);
});
