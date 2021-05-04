import { interfaces } from "../interfaces/interfaces";
import { BindingScopeEnum } from "../inversify";

export abstract class FactoryValueProviderBase<TActivated>
  implements interfaces.InitializingValueProvider<TActivated, (context:interfaces.Context) => TActivated>{
  valueFrom:  (context:interfaces.Context) => TActivated
  provideValue(context:interfaces.Context, _:interfaces.Request[]): TActivated {
      return this.valueFrom(context);
  }
  initialize(binding:interfaces.Binding<TActivated>){
      binding.scope = BindingScopeEnum.Singleton;
  }
}