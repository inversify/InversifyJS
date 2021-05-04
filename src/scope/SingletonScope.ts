import { interfaces } from "../inversify";
import { isPromise } from "../utils/async";

export class SingletonScope<T> implements interfaces.Scope<T> {
    private resolved: T | Promise<T> | undefined;
    get(binding: interfaces.Binding<T>, _: interfaces.Request): Promise<T> | T | null {
        if(this.resolved){
            return this.resolved;
        }
        return null;
    }
    set(binding: interfaces.Binding<T>, _: interfaces.Request, resolved: T | Promise<T>): T | Promise<T> {
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
        clone.resolved = this.resolved;
        return clone;
    }
}
