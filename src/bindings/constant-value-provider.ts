import { interfaces } from "../interfaces/interfaces";
import { ValueFromProvider } from "./value-from-provider";

export class ConstantValueProvider<TActivated> extends ValueFromProvider<TActivated>
implements interfaces.ConstantValueProvider<TActivated>{
  clone(binding:interfaces.Binding<TActivated>){
    const clone = new ConstantValueProvider<TActivated>();
    clone.valueFrom = this.valueFrom;
    clone.initialize(binding);
    return clone;
  }
}