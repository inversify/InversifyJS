import { ValueFromProvider } from "./value-from-provider";
import { interfaces } from "../interfaces/interfaces";
export class ConstructorValueProvider<TActivated> extends ValueFromProvider<TActivated>
  implements interfaces.ConstructorValueProvider<TActivated>{}