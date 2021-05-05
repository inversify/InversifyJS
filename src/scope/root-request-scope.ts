import { interfaces } from "../interfaces/interfaces";

export class RootRequestScope<T> implements interfaces.Scope<T>{
  get(binding:interfaces.Binding<T>,request: interfaces.Request): T | Promise<T> | undefined {
      const store = this._getRootContextRootRequestStore(request.parentContext)!;
      return store.get(binding.id);
  }
  set(binding:interfaces.Binding<T>,request:interfaces.Request,resolved:T|Promise<T>):T | Promise<T> {
    const store = this._getRootContextRootRequestStore(request.parentContext)!;
    store.set(binding.id,resolved);
    return resolved;
  }
  _getRootContextRootRequestStore(context:interfaces.Context):interfaces.RequestScope {
    while(context.parentContext !== undefined){
      context = context.parentContext;
    }
    const rootContextRootRequest = context.plan.rootRequest;
    if(rootContextRootRequest.rootRequestScope === undefined){
      rootContextRootRequest.rootRequestScope = new Map<any, any>();
    }
    return rootContextRootRequest.rootRequestScope;
  }
  clone():RootRequestScope<T>{
    return this;
  }
}