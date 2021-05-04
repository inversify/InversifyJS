import { interfaces } from "../inversify";

export class RequestResolveScope<T> implements interfaces.Scope<T> {
    get(binding: interfaces.Binding<T>, request: interfaces.Request): Promise<T> | T | null {
        const store = this._getRequestStore(request)!;
        if (store.has(binding.id)) {
            return store.get(binding.id);
        }
        return null;
    }
    set(binding: interfaces.Binding<T>, request: interfaces.Request, resolved: T | Promise<T>): T | Promise<T> {
        const store = this._getRequestStore(request)!;
        store.set(binding.id, resolved);
        return resolved;
    }
    _getRequestStore(request: interfaces.Request): interfaces.RequestScope {
        return request.parentContext.plan.rootRequest.requestScope;
    }
}
