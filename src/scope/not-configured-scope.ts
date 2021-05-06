import { interfaces } from "../interfaces/interfaces";
import * as ERROR_MSGS from "../constants/error_msgs"
import { getServiceIdentifierAsString } from "../utils/serialization";

export class NotConfiguredScope<T> implements interfaces.NotConfiguredScope<T>{
  constructor(private readonly serviceIdentifier:interfaces.ServiceIdentifier<T>){}
  type: "NotConfigured";
  get(binding: interfaces.Binding<T>, request: interfaces.Request): never {
    this._throwAccessedUnconfigured();
  }
  set(binding: interfaces.Binding<T>, request: interfaces.Request, resolved: T | Promise<T>): never {
    this._throwAccessedUnconfigured();
  }
  private _throwAccessedUnconfigured(): never{
    // The user created a binding but didn't finish it
    // e.g. container.bind<T>("Something"); missing BindingToSyntax
    const serviceIdentifierAsString = getServiceIdentifierAsString(this.serviceIdentifier);
    throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifierAsString}`);
  }
  clone(): interfaces.NotConfiguredScope<T> {
    return this;
  }
}
