import { interfaces } from "../inversify";

export class RequestResolveScope<T> implements interfaces.Scope<T> {
    get(binding: interfaces.Binding<T>, request: interfaces.Request): Promise<T> | T | undefined {
        const store = this._getRequestStore(request)!;
        return store.get(binding.id);
    }
    set(binding: interfaces.Binding<T>, request: interfaces.Request, resolved: T | Promise<T>): T | Promise<T> {
        const store = this._getRequestStore(request)!;
        store.set(binding.id, resolved);
        return resolved;
    }
    _getRequestStore(request: interfaces.Request): interfaces.RequestScope {
        return request.parentContext.plan.rootRequest.requestScope;
    }

    clone(){
        return this;
    }
}
