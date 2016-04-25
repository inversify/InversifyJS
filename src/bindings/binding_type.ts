///<reference path="../interfaces/interfaces.d.ts" />

enum BindingType {
  Invalid = 0,
  Instance = 1,
  ConstantValue = 2,
  DynamicValue = 3,
  Constructor = 4,
  Factory = 5,
  Provider = 6
}

export default BindingType;
