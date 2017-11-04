import { interfaces } from "../interfaces/interfaces";
import { BindingInWhenOnSyntax } from "./binding_in_when_on_syntax";
import { BindingWhenOnSyntax } from "./binding_when_on_syntax";
import { BindingTypeEnum } from "../constants/literal_types";
import { isStackOverflowExeption } from "../utils/exceptions";
import * as ERROR_MSGS from "../constants/error_msgs";

type FactoryType = "toDynamicValue" | "toFactory" | "toAutoFactory" | "toProvider";

function factoryWrapper<T extends Function>(
    factoryType: FactoryType,
    serviceIdentifier: interfaces.ServiceIdentifier<any>,
    factory: T
) {
    return (...args: any[]) => {
        try {
            return factory(...args);
        } catch (error) {
            if (isStackOverflowExeption(error)) {
                throw new Error(
                    ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY(factoryType, serviceIdentifier)
                );
            } else {
                throw new Error(error.message);
            }
        }
    };
}

class BindingToSyntax<T> implements interfaces.BindingToSyntax<T> {

    private _binding: interfaces.Binding<T>;

    public constructor(binding: interfaces.Binding<T>) {
        this._binding = binding;
    }

    public to(constructor: { new(...args: any[]): T; }): interfaces.BindingInWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Instance;
        this._binding.implementationType = constructor;
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

    public toSelf(): interfaces.BindingInWhenOnSyntax<T> {
        if (typeof this._binding.serviceIdentifier !== "function") {
            throw new Error(`${ERROR_MSGS.INVALID_TO_SELF_VALUE}`);
        }
        let self: any = this._binding.serviceIdentifier;
        return this.to(self);
    }

    public toConstantValue(value: T): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.ConstantValue;
        this._binding.cache = value;
        this._binding.dynamicValue = null;
        this._binding.implementationType = null;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toDynamicValue(func: (context: interfaces.Context) => T): interfaces.BindingInWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.DynamicValue;
        this._binding.cache = null;
        this._binding.dynamicValue = factoryWrapper(
            "toDynamicValue",
            this._binding.serviceIdentifier.toString(),
            func
        );
        this._binding.implementationType = null;
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

    public toConstructor<T2>(constructor: interfaces.Newable<T2>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Constructor;
        this._binding.implementationType = constructor as any;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toFactory<T2>(factory: interfaces.FactoryCreator<T2>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Factory;
        this._binding.factory = factoryWrapper(
            "toFactory",
            this._binding.serviceIdentifier.toString(),
            factory
        );
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toFunction(func: T): interfaces.BindingWhenOnSyntax<T> {
        // toFunction is an alias of toConstantValue
        if (typeof func !== "function") { throw new Error(ERROR_MSGS.INVALID_FUNCTION_BINDING); }
        let bindingWhenOnSyntax = this.toConstantValue(func);
        this._binding.type = BindingTypeEnum.Function;
        return bindingWhenOnSyntax;
    }

    public toAutoFactory<T2>(serviceIdentifier: interfaces.ServiceIdentifier<T2>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Factory;
        this._binding.factory = (context) => {
            const autofactory = () => context.container.get<T2>(serviceIdentifier);
            return factoryWrapper(
                "toAutoFactory",
                this._binding.serviceIdentifier.toString(),
                autofactory
            );
        };
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toProvider<T2>(provider: interfaces.ProviderCreator<T2>): interfaces.BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Provider;
        this._binding.provider = factoryWrapper(
            "toProvider",
            this._binding.serviceIdentifier.toString(),
            provider
        );
        return new BindingWhenOnSyntax<T>(this._binding);
    }

}

export { BindingToSyntax };
