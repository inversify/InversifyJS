import { interfaces } from "../interfaces/interfaces";

let BindingScopeEnum: interfaces.BindingScopeEnum = {
    Singleton: "Singleton",
    Transient: "Transient"
};

let BindingTypeEnum: interfaces.BindingTypeEnum = {
    ConstantValue: "ConstantValue",
    Constructor: "Constructor",
    DynamicValue: "DynamicValue",
    Factory: "Factory",
    Function: "Function",
    Instance: "Instance",
    Invalid: "Invalid",
    Provider: "Provider"
};

let TargetTypeEnum: interfaces.TargetTypeEnum = {
    ClassProperty: "ClassProperty",
    ConstructorArgument: "ConstructorArgument",
    Variable: "Variable"
};

export { BindingScopeEnum, BindingTypeEnum, TargetTypeEnum };
