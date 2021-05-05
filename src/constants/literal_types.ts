import { interfaces } from "../interfaces/interfaces";

const BindingScopeEnum: interfaces.BindingScopeEnum = {
    Request: "Request",
    Singleton: "Singleton",
    Transient: "Transient",
    RootRequest: "RootRequest"
};

const ConfigurableBindingScopeEnum: interfaces.ConfigurableBindingScopeEnum = {
    ...BindingScopeEnum,
    NotConfigured: "NotConfigured",
    Custom:"Custom"
};

const BindingTypeEnum: interfaces.BindingTypeEnum = {
    ConstantValue: "ConstantValue",
    Constructor: "Constructor",
    DynamicValue: "DynamicValue",
    Factory: "Factory",
    Function: "Function",
    Instance: "Instance",
    Invalid: "Invalid",
    Provider: "Provider"
};

const TargetTypeEnum: interfaces.TargetTypeEnum = {
    ClassProperty: "ClassProperty",
    ConstructorArgument: "ConstructorArgument",
    Variable: "Variable"
};

export { BindingScopeEnum, ConfigurableBindingScopeEnum, BindingTypeEnum, TargetTypeEnum };
