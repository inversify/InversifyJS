import { interfaces } from '../interfaces/interfaces';

// eslint-disable-next-line @typescript-eslint/naming-convention
const BindingScopeEnum: interfaces.BindingScopeEnum = {
  Request: 'Request',
  Singleton: 'Singleton',
  Transient: 'Transient',
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const BindingTypeEnum: interfaces.BindingTypeEnum = {
  ConstantValue: 'ConstantValue',
  Constructor: 'Constructor',
  DynamicValue: 'DynamicValue',
  Factory: 'Factory',
  Function: 'Function',
  Instance: 'Instance',
  Invalid: 'Invalid',
  Provider: 'Provider',
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const TargetTypeEnum: interfaces.TargetTypeEnum = {
  ClassProperty: 'ClassProperty',
  ConstructorArgument: 'ConstructorArgument',
  Variable: 'Variable',
};

export { BindingScopeEnum, BindingTypeEnum, TargetTypeEnum };
