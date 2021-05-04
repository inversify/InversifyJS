import { interfaces } from "../interfaces/interfaces";
export class DynamicValueProvider<TActivated> implements interfaces.DynamicValueProvider<TActivated>{
  valueFrom: interfaces.DynamicValue<TActivated>;
  provideValue(context:interfaces.Context, _:interfaces.Request[]): TActivated|Promise<TActivated>{
      return this.valueFrom(context);
  }
}