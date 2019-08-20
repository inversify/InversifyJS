import * as ERROR_MSGS from "../constants/error_msgs";
import { BindingTypeEnum } from "../constants/literal_types";
import { interfaces } from "../interfaces/interfaces";

class BindingToSyntax<T> implements interfaces.BindingToSyntax<T> {

    private _binding: interfaces.Binding<T>;
    private _bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>;

    public constructor(binding: interfaces.Binding<T>, bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>) {
        this._binding = binding;
        this._bindingSyntaxFactory = bindingSyntaxFactory;
    }

    public to(constructor: new (...args: any[]) => T): interfaces.BindingInWhenOnUnbindRebindSyntax<T> {
        this._binding.type = BindingTypeEnum.Instance;
        this._binding.implementationType = constructor;
        return this._bindingSyntaxFactory.getBindingInWhenOnUnbindRebind();
    }

    public toSelf(): interfaces.BindingInWhenOnUnbindRebindSyntax<T> {
        if (typeof this._binding.serviceIdentifier !== "function") {
            throw new Error(`${ERROR_MSGS.INVALID_TO_SELF_VALUE}`);
        }
        const self: any = this._binding.serviceIdentifier;
        return this.to(self);
    }

    public toConstantValue(value: T): interfaces.BindingWhenOnUnbindRebindSyntax<T> {
        this._binding.type = BindingTypeEnum.ConstantValue;
        this._binding.cache = value;
        this._binding.dynamicValue = null;
        this._binding.implementationType = null;
        return this._bindingSyntaxFactory.getBindingWhenOnUnbindRebind();
    }

    public toDynamicValue(func: (context: interfaces.Context) => T): interfaces.BindingInWhenOnUnbindRebindSyntax<T> {
        this._binding.type = BindingTypeEnum.DynamicValue;
        this._binding.cache = null;
        this._binding.dynamicValue = func;
        this._binding.implementationType = null;
        return this._bindingSyntaxFactory.getBindingInWhenOnUnbindRebind();
    }

    public toConstructor<T2>(constructor: interfaces.Newable<T2>): interfaces.BindingWhenOnUnbindRebindSyntax<T> {
        this._binding.type = BindingTypeEnum.Constructor;
        this._binding.implementationType = constructor as any;
        return this._bindingSyntaxFactory.getBindingWhenOnUnbindRebind();
    }

    public toFactory<T2>(factory: interfaces.FactoryCreator<T2>): interfaces.BindingWhenOnUnbindRebindSyntax<T> {
        this._binding.type = BindingTypeEnum.Factory;
        this._binding.factory = factory;
        return this._bindingSyntaxFactory.getBindingWhenOnUnbindRebind();
    }

    public toFunction(func: T): interfaces.BindingWhenOnUnbindRebindSyntax<T> {
        // toFunction is an alias of toConstantValue
        if (typeof func !== "function") { throw new Error(ERROR_MSGS.INVALID_FUNCTION_BINDING); }
        const bindingWhenOnSyntax = this.toConstantValue(func);
        this._binding.type = BindingTypeEnum.Function;
        return bindingWhenOnSyntax;
    }

    public toAutoFactory<T2>(serviceIdentifier: interfaces.ServiceIdentifier<T2>): interfaces.BindingWhenOnUnbindRebindSyntax<T> {
        this._binding.type = BindingTypeEnum.Factory;
        this._binding.factory = (context) => {
            const autofactory = () => context.container.get<T2>(serviceIdentifier);
            return autofactory;
        };
        return this._bindingSyntaxFactory.getBindingWhenOnUnbindRebind();
    }

    public toProvider<T2>(provider: interfaces.ProviderCreator<T2>): interfaces.BindingWhenOnUnbindRebindSyntax<T> {
        this._binding.type = BindingTypeEnum.Provider;
        this._binding.provider = provider;
        return this._bindingSyntaxFactory.getBindingWhenOnUnbindRebind();
    }

    public toService(service: string | symbol | interfaces.Newable<T> | interfaces.Abstract<T>): interfaces.BindingUnbindRebindSyntax<T> {
        this.toDynamicValue(
            (context) => context.container.get<T>(service)
        );
        return this._bindingSyntaxFactory.getUnbindRebind();
    }

}

export { BindingToSyntax };
