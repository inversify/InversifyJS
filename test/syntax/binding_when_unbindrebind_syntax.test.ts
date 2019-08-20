import { BindingWhenUnbindRebindSyntax } from "../../src/syntax/binding_when_unbindrebind_syntax";
import { unbindRebindPassthrough, whenPassthrough } from "./passThroughHelper";

describe("BindingWhenUnbindRebindSyntax", () => {
    function create(bindingSyntaxFactory: any) {
        return new BindingWhenUnbindRebindSyntax(bindingSyntaxFactory);
    }
    unbindRebindPassthrough(create);
    whenPassthrough(create);
});
