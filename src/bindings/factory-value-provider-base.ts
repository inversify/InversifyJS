import { interfaces } from "../interfaces/interfaces";
import { BindingScopeEnum } from "../inversify";

export abstract class FactoryValueProviderBase<TActivated>
  implements interfaces.ValueProvider<TActivated, (context:interfaces.Context) => TActivated>{
  valueFrom:  (context:interfaces.Context) => TActivated
  provideValue(): TActivated {
      return this.valueFrom(null as any);
  }
  initialize(binding:interfaces.Binding<TActivated>){
      binding.scope = BindingScopeEnum.Singleton;
  }
}