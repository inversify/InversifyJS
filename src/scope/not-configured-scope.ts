import { interfaces } from "../interfaces/interfaces";
import { NotConfigured } from "../utils/binding_utils";

export class NotConfiguredScope extends NotConfigured implements interfaces.NotConfiguredScope{
  get(): never {
    this._throwAccessedUnconfigured();
  }

  set(): never {
    this._throwAccessedUnconfigured();
  }

  clone(){
    return this;
  }
}
