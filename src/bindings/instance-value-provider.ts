import { interfaces } from "../interfaces/interfaces";

export class InstanceValueProvider<TActivated> implements interfaces.InstanceValueProvider<TActivated>{
  valueFrom: interfaces.Newable<TActivated>;
  provideValue(context:interfaces.Context, _:interfaces.Request[]): TActivated {
      throw new Error("Not implemented");
  }
  clone(_:interfaces.Binding<TActivated>){
    const clone = new InstanceValueProvider<TActivated>();
    clone.valueFrom = this.valueFrom;
    return clone;
  }
}