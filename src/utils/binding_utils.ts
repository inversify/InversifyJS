import { getServiceIdentifierAsString, interfaces } from "../inversify";
import * as ERROR_MSGS from "../constants/error_msgs";
export const multiBindToService = (container: interfaces.Container) =>
    (service: interfaces.ServiceIdentifier<any>) =>
        (...types: interfaces.ServiceIdentifier<any>[]) =>
            types.forEach((t) => container.bind(t).toService(service));

export const __ensureFullyBound = (binding:interfaces.Binding<unknown>):void => {
    let boundValue:unknown = null;
    switch(binding.type){
        case "ConstantValue":
        case "Function":
            boundValue = binding.cache;
            break;
        case "Constructor":
        case "Instance":
            boundValue = binding.implementationType;
            break;
        case "DynamicValue":
            boundValue = binding.dynamicValue;
            break;
        case "Provider":
            boundValue = binding.provider;
            break;
        case "Factory":
            boundValue = binding.factory;
            break;
    }
    if (boundValue === null) {
            // The user probably created a binding but didn't finish it
        // e.g. container.bind<T>("Something"); missing BindingToSyntax
        const serviceIdentifierAsString = getServiceIdentifierAsString(binding.serviceIdentifier);
        throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifierAsString}`);
    }
}
export type FactoryType = "toDynamicValue" | "toFactory" | "toAutoFactory" | "toProvider";
export type FactoryTypeFunction = (context: interfaces.Context) => any;

export interface FactoryDetails {
    factoryType:FactoryType,
    factory:FactoryTypeFunction | null
};
export const _getFactoryDetails = (binding:interfaces.Binding<unknown>): FactoryDetails | null => {
    switch(binding.type){
        case "Factory":
            return { factory: binding.factory,factoryType:"toFactory"};
        case "Provider":
            return { factory: binding.provider,factoryType:"toProvider"};
        case "DynamicValue":
            return { factory: binding.dynamicValue,factoryType:"toDynamicValue"};
    }
    return null;
}

