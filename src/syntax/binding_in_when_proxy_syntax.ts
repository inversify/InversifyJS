///<reference path="../interfaces/interfaces.d.ts" />

import BindingScope from "../bindings/binding_scope";
import Metadata from "../activation/metadata";

class BindingInWhenProxySyntax<T> implements IBindingInWhenProxySyntax<T> {

    private _binding: IBinding<T>;

    public constructor(binding: IBinding<T>) {
        this._binding = binding;
    }

    public inTransientScope(): IBindingInWhenProxySyntax<T> {
        this._binding.scope = BindingScope.Transient;
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

    public inSingletonScope(): IBindingInWhenProxySyntax<T> {
        this._binding.scope = BindingScope.Singleton;
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

    public when(constraint: (request: IRequest) => boolean): IBindingInWhenProxySyntax<T> {
        this._binding.constraint = constraint;
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

    public whenTargetNamed(name: string): IBindingInWhenProxySyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return request.target.matchesName(name);
        };
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

    public whenTargetTagged(tag: string, value: any): IBindingInWhenProxySyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return request.target.matchesTag(new Metadata(tag, value));
        };
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

    public proxy(proxymaker: (injectable: T) => T): IBindingInWhenProxySyntax<T> {
        this._binding.proxyMaker = proxymaker;
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

}

export default BindingInWhenProxySyntax;
