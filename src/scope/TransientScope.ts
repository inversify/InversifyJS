import { interfaces } from "../inversify";

export class TransientScope<T> implements interfaces.Scope<T> {
    get(): T | null {
        return null;
    }
    set(_: interfaces.Binding<T>, __: interfaces.Request, resolved: T | Promise<T>): T | Promise<T> {
        return resolved;
    }
    clone(){
        return this;
    }
}
