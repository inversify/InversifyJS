import { interfaces } from "../interfaces/interfaces";
export class DynamicValueProvider<TActivated> implements interfaces.DynamicValueProvider<TActivated>{
  valueFrom: interfaces.DynamicValue<TActivated>;
  provideValue(): TActivated|Promise<TActivated>{
      return this.valueFrom(null as any);
  }
}