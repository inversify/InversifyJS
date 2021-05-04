import { ValueFromProvider } from "./value-from-provider";
import { interfaces } from "../interfaces/interfaces";
export class ConstructorValueProvider<TActivated> extends ValueFromProvider<TActivated>
  implements interfaces.ConstructorValueProvider<TActivated>{
    clone(binding:interfaces.Binding<TActivated>){
      const clone = new ConstructorValueProvider<TActivated>();
      clone.valueFrom = this.valueFrom;
      clone.initialize(binding);
      return clone;
    }
  }