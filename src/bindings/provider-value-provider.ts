import { interfaces } from "../interfaces/interfaces";
import { FactoryValueProviderBase } from "./factory-value-provider-base";

export class ProviderValueProvider<TActivated> extends FactoryValueProviderBase<TActivated>
  implements interfaces.ProviderValueProvider<TActivated>{
    type:"Provider" = "Provider"
    factoryType:"toProvider" = "toProvider"
    clone(){
      const clone = new ProviderValueProvider<TActivated>();
      clone.valueFrom = this.valueFrom;
      return clone;
    }
}