import { BindingScopeEnum } from "../constants/literal_types";
import { interfaces } from "../interfaces/interfaces";
import { BindingWhenOnSyntax } from "./binding_when_on_syntax";
import { BindingScopeScopeFactory as BindingScopeScopeFactoryInterface } from "../scope/binding-scope-scope-factory-interface";
import { BindingScopeScopeFactory } from "../scope/binding-scope-scope-factory";

class BindingInSyntax<T> implements interfaces.BindingInSyntax<T> {

    private _binding: interfaces.Binding<T>;

    public bindingScopeScopeFactoryInterface:BindingScopeScopeFactoryInterface<T> = new BindingScopeScopeFactory<T>()

    public constructor(binding: interfaces.Binding<T>) {
        this._binding = binding;
    }

    public inRequestScope(): interfaces.BindingWhenOnSyntax<T> {
        return this.setScope(BindingScopeEnum.Request);
    }

    public inSingletonScope(): interfaces.BindingWhenOnSyntax<T> {
        return this.setScope(BindingScopeEnum.Singleton);
    }

    public inTransientScope(): interfaces.BindingWhenOnSyntax<T> {
        return this.setScope(BindingScopeEnum.Transient);
    }

    public inRootRequestScope(): interfaces.BindingWhenOnSyntax<T> {
        return this.setScope(BindingScopeEnum.RootRequest);
    }

    inCustomScope(customScope: interfaces.CustomScope<T>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.scope = customScope;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    private setScope(scope:interfaces.BindingScope): interfaces.BindingWhenOnSyntax<T>{
        this._binding.scope = this.bindingScopeScopeFactoryInterface.get(scope);
        return new BindingWhenOnSyntax<T>(this._binding);
    }
}

export { BindingInSyntax };
