import { interfaces } from "../interfaces/interfaces";

const BindingScopeEnum: interfaces.BindingScopeEnum = {
    Request: "Request",
    Singleton: "Singleton",
    Transient: "Transient",
    RootRequest: "RootRequest"
};

const ConfigurableBindingScopeEnum: interfaces.ConfigurableBindingScopeEnum = {
    ...BindingScopeEnum,
    Custom:"Custom"
};

const BindingTypeEnum: interfaces.BindingTypeEnum = {
    ConstantValue: "ConstantValue",
    Constructor: "Constructor",
    DynamicValue: "DynamicValue",
    Factory: "Factory",
    Instance: "Instance",
    Provider: "Provider"
};

const TargetTypeEnum: interfaces.TargetTypeEnum = {
    ClassProperty: "ClassProperty",
    ConstructorArgument: "ConstructorArgument",
    Variable: "Variable"
};

export { BindingScopeEnum, ConfigurableBindingScopeEnum, BindingTypeEnum, TargetTypeEnum };
