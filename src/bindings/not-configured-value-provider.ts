import { interfaces } from "../interfaces/interfaces";
import { NotConfigured } from "../utils/binding_utils";

export class NotConfiguredValueProvider extends NotConfigured implements interfaces.NotConfiguredValueProvider{
  valueFrom:never;
  provideValue():never{
    this._throwAccessedUnconfigured();
  }
}