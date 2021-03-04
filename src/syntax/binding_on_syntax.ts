import { interfaces } from "../interfaces/interfaces";
import { BindingWhenSyntax } from "./binding_when_syntax";

class BindingOnSyntax<T> implements interfaces.BindingOnSyntax<T> {

    private _binding: interfaces.Binding<T>;

    public constructor(binding: interfaces.Binding<T>) {
        this._binding = binding;
    }

    public onActivation(handler: (context: interfaces.Context, injectable: T) => T): interfaces.BindingWhenSyntax<T> {
        this._binding.onActivation = handler;
        return new BindingWhenSyntax<T>(this._binding);
    }

}

export { BindingOnSyntax };
