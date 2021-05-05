import { ValueProviderFactory } from "../bindings/value-provider-factory";
import * as ERROR_MSGS from "../constants/error_msgs";
import { BindingScopeEnum } from "../constants/literal_types";
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
        return this.initialize("toInstance",constructor,false);
    }

    public toSelf(): interfaces.BindingInWhenOnSyntax<T> {
        if (typeof this._binding.serviceIdentifier !== "function") {
            throw new Error(`${ERROR_MSGS.INVALID_TO_SELF_VALUE}`);
        }
        const self: any = this._binding.serviceIdentifier;
        return this.to(self);
    }

    public toConstantValue(value: T): interfaces.BindingWhenOnSyntax<T> {
        return this.initialize("toConstantValue", value,true);
    }

    public toDynamicValue(func: interfaces.DynamicValue<T>): interfaces.BindingInWhenOnSyntax<T> {
        return this.initialize("toDynamicValue",func, false);
    }

    public toConstructor<T2>(constructor: interfaces.Newable<T2>): interfaces.BindingWhenOnSyntax<T> {
        //tbd change generics
        return this.initialize("toConstructor", constructor as unknown as T, true);
    }

    public toFactory<T2>(factory: interfaces.FactoryCreator<T2>): interfaces.BindingWhenOnSyntax<T> {
        return this.initialize("toFactory",factory as unknown as (context:interfaces.Context)=>T, true);
    }

    public toFunction(func: T): interfaces.BindingWhenOnSyntax<T> {
        // toFunction is an alias of toConstantValue
        if (typeof func !== "function") { throw new Error(ERROR_MSGS.INVALID_FUNCTION_BINDING); }
        return this.toConstantValue(func);
    }

    public toAutoFactory<T2>(serviceIdentifier: interfaces.ServiceIdentifier<T2>): interfaces.BindingWhenOnSyntax<T> {
        return this.toFactory((context) => {
            const autofactory = () => context.container.get<T2>(serviceIdentifier);
            return autofactory;
        });
    }

    public toProvider<T2>(provider: interfaces.ProviderCreator<T2>): interfaces.BindingWhenOnSyntax<T> {
        return this.initialize("toProvider",provider as unknown as (context:interfaces.Context)=>T, true);
    }

    public toService(service: string | symbol | interfaces.Newable<T> | interfaces.Abstract<T>): void {
        this.toDynamicValue(
            (context) => context.container.get<T>(service)
        );
    }
    private initialize<TKey extends keyof interfaces.ValueProviderFactory<T>>(
        valueProviderType:TKey,
        valueFrom:ExtractValueFrom<ReturnType<interfaces.ValueProviderFactory<T>[TKey]>>,
        singleton:boolean
    ): interfaces.BindingInWhenOnSyntax<T>{
        const valueProvider = this._valueProviderFactory[valueProviderType]();
        valueProvider.valueFrom = valueFrom;
        this._binding.valueProvider = valueProvider;
        if(singleton){
            this._binding.setScope(BindingScopeEnum.Singleton);
        }
        return new BindingInWhenOnSyntax<T>(this._binding);
    }
}

export { BindingToSyntax };
