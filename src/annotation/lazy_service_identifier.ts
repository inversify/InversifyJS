import { interfaces } from "../interfaces/interfaces";

export type ServiceIdentifierOrFunc = interfaces.ServiceIdentifier<any> | LazyServiceIdentifer;

export class LazyServiceIdentifer<T = any> {
  private _cb: () => interfaces.ServiceIdentifier<T>;
  public constructor(cb: () => interfaces.ServiceIdentifier<T>) {
    this._cb = cb;
  }

  public unwrap() {
    return this._cb();
  }
}
