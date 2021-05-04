import { interfaces } from "../interfaces/interfaces";
import { FactoryValueProviderBase } from "./factory-value-provider-base";

export class FactoryValueProvider<TActivated> extends FactoryValueProviderBase<TActivated>
  implements interfaces.FactoryValueProvider<TActivated>{
   factoryType:"toFactory"= "toFactory";
  }