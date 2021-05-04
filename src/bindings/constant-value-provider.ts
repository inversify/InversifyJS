import { interfaces } from "../interfaces/interfaces";
import { ValueFromProvider } from "./value-from-provider";

export class ConstantValueProvider<TActivated> extends ValueFromProvider<TActivated>
implements interfaces.ConstantValueProvider<TActivated>{}