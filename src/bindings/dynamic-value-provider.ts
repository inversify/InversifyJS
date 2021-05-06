import { interfaces } from "../interfaces/interfaces";
export class DynamicValueProvider<TActivated> implements interfaces.DynamicValueProvider<TActivated>{
  type: "DynamicValue" = "DynamicValue"
  factoryType:"toDynamicValue" = "toDynamicValue"
  valueFrom: interfaces.DynamicValue<TActivated>;
  provideValue(context:interfaces.Context, _:interfaces.Request[]): TActivated|Promise<TActivated>{
    return this.valueFrom(context);
  }
  clone(){
    const clone = new DynamicValueProvider<TActivated>();
    clone.valueFrom = this.valueFrom;
    return clone;
  }
}