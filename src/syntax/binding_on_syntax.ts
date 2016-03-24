///<reference path="../interfaces/interfaces.d.ts" />

import BindingWhenSyntax from "./binding_when_syntax";

class BindingOnSyntax<T> implements IBindingOnSyntax<T> {

    private _binding: IBinding<T>;

    public constructor(binding: IBinding<T>) {
        this._binding = binding;
    }

    public onActivation(handler: (context: IContext, injectable: T) => T): IBindingWhenSyntax<T> {
        this._binding.onActivation = handler;
        return new BindingWhenSyntax<T>(this._binding);
    }

}

export default BindingOnSyntax;
