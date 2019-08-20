import { interfaces } from "../../src/inversify";
import { BindingInSyntax } from "./binding_in_syntax";
import { BindingInWhenOnUnbindRebindSyntax } from "./binding_in_when_on_unbindrebind_syntax";
import { BindingOnSyntax } from "./binding_on_syntax";
import { BindingOnUnbindRebindSyntax } from "./binding_on_unbindrebind_syntax";
import { BindingToSyntax } from "./binding_to_syntax";
import { BindingUnbindRebindSyntax } from "./binding_unbindrebind_syntax";
import { BindingWhenOnUnbindRebindSyntax } from "./binding_when_on_unbindrebind_syntax";
import { BindingWhenSyntax } from "./binding_when_syntax";
import { BindingWhenUnbindRebindSyntax } from "./binding_when_unbindrebind_syntax";

export class BindingSyntaxFactory<T> implements interfaces.BindingSyntaxFactory<T> {
    constructor(
        private readonly binding: interfaces.Binding<T>,
        private readonly unbind: () => void,
        private bind: (serviceIdentifier: interfaces.ServiceIdentifier<any>) => interfaces.BindingToSyntax<any>) {}

    public getBindingTo(): interfaces.BindingToSyntax<T> {
        return new BindingToSyntax(this.binding, this);
    }
    public getBindingIn(): interfaces.BindingInSyntax<T> {
        return new BindingInSyntax(this.binding, this);
    }
    public getBindingOn(): interfaces.BindingOnSyntax<T> {
        return new BindingOnSyntax(this.binding, this);
    }
    public getBindingWhen(): interfaces.BindingWhenSyntax<T> {
        return new BindingWhenSyntax(this.binding, this);
    }
    public getUnbindRebind(): interfaces.BindingUnbindRebindSyntax<T> {
        return new BindingUnbindRebindSyntax(this.binding, this.unbind, this.bind);
    }
    public getBindingInWhenOnUnbindRebind(): interfaces.BindingInWhenOnUnbindRebindSyntax<T> {
        return new BindingInWhenOnUnbindRebindSyntax(this);
    }
    public getBindingWhenOnUnbindRebind(): interfaces.BindingWhenOnUnbindRebindSyntax<T> {
        return new BindingWhenOnUnbindRebindSyntax(this);
    }
    public getBindingWhenUnbindRebind(): interfaces.BindingWhenUnbindRebindSyntax<T> {
        return new BindingWhenUnbindRebindSyntax(this);
    }
    public getBindingOnUnbindRebind(): interfaces.BindingOnUnbindRebindSyntax<T> {
        return new BindingOnUnbindRebindSyntax(this);
    }
}
