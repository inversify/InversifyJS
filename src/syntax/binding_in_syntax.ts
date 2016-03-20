///<reference path="../interfaces/interfaces.d.ts" />

import BindingScope from "../bindings/binding_scope";
import BindingWhenOnSyntax from "./binding_when_on_syntax";

class BindingInSyntax<T> implements IBindingInSyntax<T> {

    private _binding: IBinding<T>;

    public constructor(binding: IBinding<T>) {
        this._binding = binding;
    }

    public inSingletonScope(): IBindingWhenOnSyntax<T> {
        this._binding.scope = BindingScope.Singleton;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

}

export default BindingInSyntax;
