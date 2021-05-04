import { interfaces } from "../interfaces/interfaces";
import { FactoryValueProviderBase } from "./factory-value-provider-base";

export class ProviderValueProvider<TActivated> extends FactoryValueProviderBase<TActivated>
  implements interfaces.ProviderValueProvider<TActivated>{}