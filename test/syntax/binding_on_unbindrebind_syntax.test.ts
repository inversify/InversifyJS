import { BindingOnUnbindRebindSyntax } from "../../src/syntax/binding_on_unbindrebind_syntax";
import { onPassthrough, unbindRebindPassthrough } from "./passThroughHelper";

describe("BindingOnUnbindRebindSyntax", () => {
    function create(bindingSyntaxFactory: any) {
        return new BindingOnUnbindRebindSyntax(bindingSyntaxFactory);
    }
    unbindRebindPassthrough(create);
    onPassthrough(create);
});
