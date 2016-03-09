///<reference path="../interfaces/interfaces.d.ts" />

import BindingScope from "../bindings/binding_scope";

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

    public proxy(proxymaker: (injectable: T) => T): IBindingInWhenProxySyntax<T> {
        this._binding.proxyMaker = proxymaker;
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

}

export default BindingInWhenProxySyntax;
