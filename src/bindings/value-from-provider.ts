import { interfaces } from "../interfaces/interfaces";

export abstract class ValueFromProvider<TActivated> implements interfaces.ValueProvider<TActivated,TActivated>{
  valueFrom: TActivated;
  provideValue(): TActivated|Promise<TActivated>{
      return this.valueFrom;
  }
  abstract clone():ValueFromProvider<TActivated>
}