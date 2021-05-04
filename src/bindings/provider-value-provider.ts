import { interfaces } from "../interfaces/interfaces";
import { FactoryValueProviderBase } from "./factory-value-provider-base";

export class ProviderValueProvider<TActivated> extends FactoryValueProviderBase<TActivated>
  implements interfaces.ProviderValueProvider<TActivated>{
  factoryType:"toProvider" = "toProvider"
  clone(binding:interfaces.Binding<TActivated>){
    const clone = new ProviderValueProvider<TActivated>();
    clone.valueFrom = this.valueFrom;
    this.initialize(binding);
    return clone;
  }
}