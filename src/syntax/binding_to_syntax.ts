import { ValueProviderFactory } from "../bindings/value-provider-factory";
import * as ERROR_MSGS from "../constants/error_msgs";
import { BindingTypeEnum } from "../constants/literal_types";
import { interfaces } from "../interfaces/interfaces";
import { BindingInWhenOnSyntax } from "./binding_in_when_on_syntax";

type ExtractValueFrom<P> = P extends interfaces.ValueProvider<any,infer T> ? T : never;

class BindingToSyntax<T> implements interfaces.BindingToSyntax<T> {

    private _binding: interfaces.Binding<T>;
    private _valueProviderFactory: interfaces.ValueProviderFactory<T> = new ValueProviderFactory();

    public constructor(binding: interfaces.Binding<T>) {
        this._binding = binding;
    }

    public to(constructor: new (...args: any[]) => T): interfaces.BindingInWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Instance;
        this._binding.implementationType = constructor;
        return this.initialize("toInstance",constructor);
    }

    public toSelf(): interfaces.BindingInWhenOnSyntax<T> {
        if (typeof this._binding.serviceIdentifier !== "function") {
            throw new Error(`${ERROR_MSGS.INVALID_TO_SELF_VALUE}`);
        }
        const self: any = this._binding.serviceIdentifier;
        return this.to(self);
    }

    public toConstantValue(value: T): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.ConstantValue;
        this._binding.cache = value;
        this._binding.dynamicValue = null;
        this._binding.implementationType = null;
        return this.initialize("toConstantValue", value);
    }

    public toDynamicValue(func: interfaces.DynamicValue<T>): interfaces.BindingInWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.DynamicValue;
        this._binding.cache = null;
        this._binding.dynamicValue = func;
        this._binding.implementationType = null;
        return this.initialize("toDynamicValue",func);
    }

    public toConstructor<T2>(constructor: interfaces.Newable<T2>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Constructor;
        this._binding.implementationType = constructor as any;
        //tbd change generics
        return this.initialize("toConstructor", constructor as unknown as T);
    }

    public toFactory<T2>(factory: interfaces.FactoryCreator<T2>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Factory;
        this._binding.factory = factory;
        return this.initialize("toFactory",factory as unknown as (context:interfaces.Context)=>T);
    }

    public toFunction(func: T): interfaces.BindingWhenOnSyntax<T> {
        // toFunction is an alias of toConstantValue
        if (typeof func !== "function") { throw new Error(ERROR_MSGS.INVALID_FUNCTION_BINDING); }
        const bindingWhenOnSyntax = this.toConstantValue(func);
        this._binding.type = BindingTypeEnum.Function;
        return bindingWhenOnSyntax;
    }

    public toAutoFactory<T2>(serviceIdentifier: interfaces.ServiceIdentifier<T2>): interfaces.BindingWhenOnSyntax<T> {
        return this.toFactory((context) => {
            const autofactory = () => context.container.get<T2>(serviceIdentifier);
            return autofactory;
        });
    }

    public toProvider<T2>(provider: interfaces.ProviderCreator<T2>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Provider;
        this._binding.provider = provider;
        return this.initialize("toProvider",provider as unknown as (context:interfaces.Context)=>T);
    }

    public toService(service: string | symbol | interfaces.Newable<T> | interfaces.Abstract<T>): void {
        this.toDynamicValue(
            (context) => context.container.get<T>(service)
        );
    }
    private initialize<TKey extends keyof interfaces.ValueProviderFactory<T>>(
        valueProviderType:TKey,
        valueFrom:ExtractValueFrom<ReturnType<interfaces.ValueProviderFactory<T>[TKey]>>
    ): interfaces.BindingInWhenOnSyntax<T>{
        const valueProvider = this._valueProviderFactory[valueProviderType]();
        valueProvider.valueFrom = valueFrom;
        this._binding.valueProvider = valueProvider;
        if(valueProvider.initialize){
            valueProvider.initialize(this._binding);
        }
        return new BindingInWhenOnSyntax<T>(this._binding);
    }
}

export { BindingToSyntax };
