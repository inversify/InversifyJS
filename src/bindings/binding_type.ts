///<reference path="../interfaces/interfaces.d.ts" />

enum BindingType {
  Invalid = 0,
  Instance = 1,
  Value = 2,
  Constructor = 3,
  Factory = 4,
  Provider = 5
}

export default BindingType;
