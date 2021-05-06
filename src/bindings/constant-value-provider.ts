import { interfaces } from "../interfaces/interfaces";
import { ValueFromProvider } from "./value-from-provider";

export class ConstantValueProvider<TActivated> extends ValueFromProvider<TActivated>
implements interfaces.ConstantValueProvider<TActivated>{
  type: "ConstantValue" = "ConstantValue"
  clone(){
    const clone = new ConstantValueProvider<TActivated>();
    clone.valueFrom = this.valueFrom;
    return clone;
  }
}