import { BindingWhenOnUnbindRebindSyntax } from "../../src/syntax/binding_when_on_unbindrebind_syntax";
import { onPassthrough, unbindRebindPassthrough, whenPassthrough } from "./passThroughHelper";

describe("BindingWhenOnUnbindRebindSyntax", () => {
    function create(bindingSyntaxFactory: any) {
        return new BindingWhenOnUnbindRebindSyntax(bindingSyntaxFactory);
    }
    unbindRebindPassthrough(create);
    whenPassthrough(create);
    onPassthrough(create);
});
