///<reference path="../interfaces/interfaces.d.ts" />

import BindingWhenSyntax from "./binding_when_syntax";
import BindingScope from "../bindings/binding_scope";

class BindingInSyntax<T> implements IBindingInSyntax<T> {

    private _binding: IBinding<T>;

    public constructor(binding: IBinding<T>) {
        this._binding = binding;
    }

    public inTransientScope(): IBindingWhenSyntax<T> {
        this._binding.scope = BindingScope.Transient;
        return new BindingWhenSyntax<T>(this._binding);
    }

    public inSingletonScope(): IBindingWhenSyntax<T> {
        this._binding.scope = BindingScope.Singleton;
        return new BindingWhenSyntax<T>(this._binding);
    }

}

export default BindingInSyntax;
