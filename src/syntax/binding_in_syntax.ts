import { BindingScopeEnum } from "../constants/literal_types";
import { interfaces } from "../interfaces/interfaces";

class BindingInSyntax<T> implements interfaces.BindingInSyntax<T> {

    private _binding: interfaces.Binding<T>;
    private _bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>;

    public constructor(binding: interfaces.Binding<T>, bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>) {
        this._binding = binding;
        this._bindingSyntaxFactory = bindingSyntaxFactory;
    }

    public inRequestScope(): interfaces.BindingWhenOnUnbindRebindSyntax<T> {
        return this.setScope(BindingScopeEnum.Request);
    }

    public inSingletonScope(): interfaces.BindingWhenOnUnbindRebindSyntax<T> {
        return this.setScope(BindingScopeEnum.Singleton);
    }

    public inTransientScope(): interfaces.BindingWhenOnUnbindRebindSyntax<T> {
        return this.setScope(BindingScopeEnum.Transient);
    }
    private setScope(scope: interfaces.BindingScope): interfaces.BindingWhenOnUnbindRebindSyntax<T> {
        this._binding.scope = scope;
        return this._bindingSyntaxFactory.getBindingWhenOnUnbindRebind();
    }
}

export { BindingInSyntax };
