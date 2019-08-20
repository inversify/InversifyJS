import { interfaces } from "../interfaces/interfaces";

class BindingOnSyntax<T> implements interfaces.BindingOnSyntax<T> {

    private _binding: interfaces.Binding<T>;
    private _bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>;

    public constructor(binding: interfaces.Binding<T>, bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>) {
        this._binding = binding;
        this._bindingSyntaxFactory = bindingSyntaxFactory;
    }

    public onActivation(handler: (context: interfaces.Context, injectable: T) => T): interfaces.BindingWhenUnbindRebindSyntax<T> {
        this._binding.onActivation = handler;
        return this._bindingSyntaxFactory.getBindingWhenUnbindRebind();
    }

}

export { BindingOnSyntax };
