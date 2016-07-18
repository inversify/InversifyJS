import interfaces from "../interfaces/interfaces";
import BindingScope from "../bindings/binding_scope";
import BindingWhenOnSyntax from "./binding_when_on_syntax";

class BindingInSyntax<T> implements interfaces.BindingInSyntax<T> {

    private _binding: interfaces.Binding<T>;

    public constructor(binding: interfaces.Binding<T>) {
        this._binding = binding;
    }

    public inSingletonScope(): interfaces.BindingWhenOnSyntax<T> {
        this._binding.scope = BindingScope.Singleton;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public inTransientScope(): interfaces.BindingWhenOnSyntax<T> {
        this._binding.scope = BindingScope.Transient;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

}

export default BindingInSyntax;
