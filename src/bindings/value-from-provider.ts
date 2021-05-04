import { BindingScopeEnum } from "../constants/literal_types";
import { interfaces } from "../interfaces/interfaces";

export abstract class ValueFromProvider<TActivated> implements interfaces.InitializingValueProvider<TActivated,TActivated>{
  valueFrom: TActivated;
  provideValue(): TActivated|Promise<TActivated>{
      return this.valueFrom;
  }
  initialize(binding:interfaces.Binding<TActivated>){
      binding.setScope(BindingScopeEnum.Singleton);
  }
  abstract clone():ValueFromProvider<TActivated>
}