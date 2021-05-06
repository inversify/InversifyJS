import { interfaces } from "../inversify";
import { getServiceIdentifierAsString } from "../utils/serialization";
import * as ERROR_MSGS from "../constants/error_msgs";

export const multiBindToService = (container: interfaces.Container) =>
    (service: interfaces.ServiceIdentifier<any>) =>
        (...types: interfaces.ServiceIdentifier<any>[]) =>
            types.forEach((t) => container.bind(t).toService(service));

export abstract class NotConfigured {
    type: "NotConfigured" = "NotConfigured";
    constructor(public readonly serviceIdentifier:interfaces.ServiceIdentifier<any>){}
    clone(){
        return this;
    }
    protected _throwAccessedUnconfigured(): never{
        // The user created a binding but didn't finish it
        // e.g. container.bind<T>("Something"); missing BindingToSyntax
        const serviceIdentifierAsString = getServiceIdentifierAsString(this.serviceIdentifier);
        throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifierAsString}`);
    }
}


