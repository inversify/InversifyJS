import { interfaces } from "../interfaces/interfaces";
import { FactoryValueProviderBase } from "./factory-value-provider-base";

export class FactoryValueProvider<TActivated> extends FactoryValueProviderBase<TActivated>
  implements interfaces.FactoryValueProvider<TActivated>{
   factoryType:"toFactory"= "toFactory";
   clone(){
    const clone = new FactoryValueProvider<TActivated>();
    clone.valueFrom = this.valueFrom;
    return clone;
  }
}