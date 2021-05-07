import { interfaces } from "../interfaces/interfaces";

export abstract class FactoryValueProviderBase<TActivated>
  implements interfaces.ValueProvider<TActivated, (context:interfaces.Context) => TActivated>{
  valueFrom:  (context:interfaces.Context) => TActivated
  provideValue(context:interfaces.Context, _:interfaces.Request[]): TActivated | Promise<TActivated> {
    return this.valueFrom(context);
  }
  abstract clone():FactoryValueProviderBase<TActivated>
}