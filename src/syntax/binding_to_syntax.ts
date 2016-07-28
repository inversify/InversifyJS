import interfaces from "../interfaces/interfaces";
import BindingInWhenOnSyntax from "./binding_in_when_on_syntax";
import BindingWhenOnSyntax from "./binding_when_on_syntax";
import BindingType from "../bindings/binding_type";
import * as ERROR_MSGS from "../constants/error_msgs";

class BindingToSyntax<T> implements interfaces.BindingToSyntax<T> {

    private _binding: interfaces.Binding<T>;

    public constructor(binding: interfaces.Binding<T>) {
        this._binding = binding;
    }

    public to(constructor: { new(...args: any[]): T; }): interfaces.BindingInWhenOnSyntax<T> {
        this._binding.type = BindingType.Instance;
        this._binding.implementationType = constructor;
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

    public toSelf(): interfaces.BindingInWhenOnSyntax<T> {
        return this.to(<any>this._binding.serviceIdentifier);
    }

    public toConstantValue(value: T): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingType.ConstantValue;
        this._binding.cache = value;
        this._binding.dynamicValue = null;
        this._binding.implementationType = null;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toDynamicValue(func: () => T): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingType.DynamicValue;
        this._binding.cache = null;
        this._binding.dynamicValue = func;
        this._binding.implementationType = null;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toConstructor<T2>(constructor: interfaces.Newable<T2>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingType.Constructor;
        this._binding.implementationType = <any>constructor;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toFactory<T2>(factory: interfaces.FactoryCreator<T2>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingType.Factory;
        this._binding.factory = <any>factory;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toFunction(func: T): interfaces.BindingWhenOnSyntax<T> {
        // toFunction is an alias of toConstantValue
        if (typeof func !== "function") { throw new Error(ERROR_MSGS.INVALID_FUNCTION_BINDING); };
        let bindingWhenOnSyntax = this.toConstantValue(func);
        this._binding.type = BindingType.Function;
        return bindingWhenOnSyntax;
    }

    public toAutoFactory<T2>(serviceIdentifier: interfaces.ServiceIdentifier<T2>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingType.Factory;
        this._binding.factory = (context) => {
            return () => {
                return context.kernel.get<T2>(serviceIdentifier);
            };
        };
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toProvider<T2>(provider: interfaces.ProviderCreator<T2>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingType.Provider;
        this._binding.provider = <any>provider;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

}

export default BindingToSyntax;
