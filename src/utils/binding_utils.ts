import { getServiceIdentifierAsString, interfaces } from '../inversify';
import * as ERROR_MSGS from '../constants/error_msgs';
import { BindingTypeEnum } from '../constants/literal_types';
import { FactoryType } from './factory_type';

export const multiBindToService = (container: interfaces.Container) =>
  (service: interfaces.ServiceIdentifier) =>
    (...types: interfaces.ServiceIdentifier[]) =>
      types.forEach((t) => container.bind(t).toService(service));

export const ensureFullyBound = <T = unknown>(binding: interfaces.Binding<T>): void => {
  let boundValue: unknown = null;

  switch (binding.type) {
    case BindingTypeEnum.ConstantValue:
    case BindingTypeEnum.Function:
      boundValue = binding.cache;
      break;
    case BindingTypeEnum.Constructor:
    case BindingTypeEnum.Instance:
      boundValue = binding.implementationType;
      break;
    case BindingTypeEnum.DynamicValue:
      boundValue = binding.dynamicValue;
      break;
    case BindingTypeEnum.Provider:
      boundValue = binding.provider;
      break;
    case BindingTypeEnum.Factory:
      boundValue = binding.factory;
      break;
  }
  if (boundValue === null) {
    // The user probably created a binding but didn't finish it
    // e.g. container.bind<T>('Something'); missing BindingToSyntax
    const serviceIdentifierAsString = getServiceIdentifierAsString(binding.serviceIdentifier);
    throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifierAsString}`);
  }
}

export const getFactoryDetails = <T = unknown>(binding: interfaces.Binding<T>): interfaces.FactoryDetails => {
  switch (binding.type) {
    case BindingTypeEnum.Factory:
      return { factory: binding.factory, factoryType: FactoryType.Factory };
    case BindingTypeEnum.Provider:
      return { factory: binding.provider, factoryType: FactoryType.Provider };
    case BindingTypeEnum.DynamicValue:
      return { factory: binding.dynamicValue, factoryType: FactoryType.DynamicValue };
    default:
      throw new Error(`Unexpected factory type ${binding.type}`);
  }
}

