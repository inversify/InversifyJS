import { interfaces } from "../inversify";
import { isPromise } from "../utils/async";

export class SingletonScope<T> implements interfaces.Scope<T> {
    public resolved: T | Promise<T> | undefined;
    get(_: interfaces.Binding<T>, __: interfaces.Request): Promise<T> | T | undefined {
        return this.resolved;
    }
    set(_: interfaces.Binding<T>, __: interfaces.Request, resolved: T | Promise<T>): T | Promise<T> {
        if (isPromise(resolved)) {
            resolved = resolved.catch((ex) => {
                // allow binding to retry in future
                this.resolved = undefined;
                throw ex;
            });
        }
        this.resolved = resolved;
        return this.resolved;
    }

    clone(){
        const clone = new SingletonScope<T>();
        if(this.resolved){
            clone.set(null as any, null as any,this.resolved);
        }
        return clone;
    }
}
