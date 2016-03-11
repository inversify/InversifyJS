///<reference path="../interfaces/interfaces.d.ts" />

import BindingInWhenProxySyntax from "./binding_in_when_proxy_syntax";
import BindingType from "../bindings/binding_type";

class BindingToSyntax<T> implements IBindingToSyntax<T> {

    private _binding: IBinding<T>;

    public constructor(binding: IBinding<T>) {
        this._binding = binding;
    }

    public to(constructor: { new(...args: any[]): T; }): IBindingInWhenProxySyntax<T> {
        this._binding.type = BindingType.Instance;
        this._binding.implementationType = constructor;
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

    public toValue(value: T): IBindingInWhenProxySyntax<T> {
        this._binding.type = BindingType.Value;
        this._binding.cache = value;
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

    public toConstructor<T2>(constructor: INewable<T2>): IBindingInWhenProxySyntax<T> {
        this._binding.type = BindingType.Constructor;
        this._binding.implementationType = <any>constructor;
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

    public toFactory<T2>(factory: IFactoryCreator<T2>): IBindingInWhenProxySyntax<T> {
        this._binding.type = BindingType.Factory;
        this._binding.factory = <any>factory;
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

    public toAutoFactory<T2>(): IBindingInWhenProxySyntax<T> {
        this._binding.type = BindingType.Factory;
        let id = this._binding.runtimeIdentifier.split("IFactory<").join("").split(">").join("");
        this._binding.factory = (context) => {
            return () => {
                return context.kernel.get<T2>(id);
            };
        };
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

    public toProvider<T2>(provider: IProviderCreator<T2>): IBindingInWhenProxySyntax<T> {
        this._binding.type = BindingType.Provider;
        this._binding.provider = <any>provider;
        return new BindingInWhenProxySyntax<T>(this._binding);
    }

}

export default BindingToSyntax;
