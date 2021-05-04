import { interfaces } from "../interfaces/interfaces";

export class InstanceValueProvider<TActivated> implements interfaces.InstanceValueProvider<TActivated>{
  valueFrom: interfaces.Newable<TActivated>;
  provideValue(): TActivated {
      throw new Error("Not implemented");
  }
}