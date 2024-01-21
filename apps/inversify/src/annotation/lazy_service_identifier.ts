import { interfaces } from '../interfaces/interfaces';

export type ServiceIdentifierOrFunc<T> = interfaces.ServiceIdentifier<T> | LazyServiceIdentifier<T>;

export class LazyServiceIdentifier<T = unknown> {
  private _cb: () => interfaces.ServiceIdentifier<T>;
  public constructor(cb: () => interfaces.ServiceIdentifier<T>) {
    this._cb = cb;
  }

  public unwrap() {
    return this._cb();
  }
}
