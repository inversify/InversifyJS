import { interfaces } from "../inversify";

export class TransientScope<T> implements interfaces.TransientScope<T> {
    type:"Transient" = "Transient"
    get(): T | undefined {
        return undefined;
    }
    set(_: interfaces.Binding<T>, __: interfaces.Request, resolved: T | Promise<T>): T | Promise<T> {
        return resolved;
    }
    clone(){
        return this;
    }
}
