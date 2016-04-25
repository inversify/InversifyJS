///<reference path="../interfaces/interfaces.d.ts" />

import BindingInWhenOnSyntax from "./binding_in_when_on_syntax";
import BindingWhenOnSyntax from "./binding_when_on_syntax";
import BindingType from "../bindings/binding_type";

class BindingToSyntax<T> implements IBindingToSyntax<T> {

    private _binding: IBinding<T>;

    public constructor(binding: IBinding<T>) {
        this._binding = binding;
    }

    public to(constructor: { new(...args: any[]): T; }): IBindingInWhenOnSyntax<T> {
        this._binding.type = BindingType.Instance;
        this._binding.implementationType = constructor;
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

    public toConstantValue(value: T): IBindingWhenOnSyntax<T> {
        this._binding.type = BindingType.ConstantValue;
        this._binding.cache = value;
        this._binding.dynamicValue = null;
        this._binding.implementationType = null;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toDynamicValue(func: () => T): IBindingWhenOnSyntax<T> {
        this._binding.type = BindingType.DynamicValue;
        this._binding.cache = null;
        this._binding.dynamicValue = func;
        this._binding.implementationType = null;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toConstructor<T2>(constructor: INewable<T2>): IBindingWhenOnSyntax<T> {
        this._binding.type = BindingType.Constructor;
        this._binding.implementationType = <any>constructor;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toFactory<T2>(factory: IFactoryCreator<T2>): IBindingWhenOnSyntax<T> {
        this._binding.type = BindingType.Factory;
        this._binding.factory = <any>factory;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toAutoFactory<T2>(serviceIdentifier: (string|Symbol|INewable<T2>)): IBindingWhenOnSyntax<T> {
        this._binding.type = BindingType.Factory;
        this._binding.factory = (context) => {
            return () => {
                return context.kernel.get<T2>(serviceIdentifier);
            };
        };
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toProvider<T2>(provider: IProviderCreator<T2>): IBindingWhenOnSyntax<T> {
        this._binding.type = BindingType.Provider;
        this._binding.provider = <any>provider;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

}

export default BindingToSyntax;
