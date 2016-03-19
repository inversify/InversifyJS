///<reference path="../interfaces/interfaces.d.ts" />

import BindingScope from "../bindings/binding_scope";
import Metadata from "../planning/metadata";

class BindingInWhenOnSyntax<T> implements IBindingInWhenOnSyntax<T> {

    private _binding: IBinding<T>;

    public constructor(binding: IBinding<T>) {
        this._binding = binding;
    }

    public inTransientScope(): IBindingInWhenOnSyntax<T> {
        this._binding.scope = BindingScope.Transient;
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

    public inSingletonScope(): IBindingInWhenOnSyntax<T> {
        this._binding.scope = BindingScope.Singleton;
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

    public when(constraint: (request: IRequest) => boolean): IBindingInWhenOnSyntax<T> {
        this._binding.constraint = constraint;
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

    public whenTargetNamed(name: string): IBindingInWhenOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return request.target.matchesName(name);
        };
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

    public whenTargetTagged(tag: string, value: any): IBindingInWhenOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            let metadata = new Metadata(tag, value);
            return request.target.matchesTag(metadata);
        };
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

    public onActivation(handler: (context: IContext, injectable: T) => T): IBindingInWhenOnSyntax<T> {
        this._binding.onActivation = handler;
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

}

export default BindingInWhenOnSyntax;
