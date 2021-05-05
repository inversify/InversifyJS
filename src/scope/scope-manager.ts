import { interfaces } from "../interfaces/interfaces";
import * as ERROR_MSGS from "../constants/error_msgs";
import { ConfigurableBindingScopeEnum } from "../constants/literal_types";
import { ResolveScopeFactory } from "./resolve-scope-factory";

export class ScopeManager<T> implements interfaces.ScopeManager<T>{
  scope = ConfigurableBindingScopeEnum.NotConfigured
  resolveScope: interfaces.Scope<T> | undefined;

  scopeFactory:interfaces.ResolveScopeFactory<T> = new ResolveScopeFactory<T>();
  get(binding: interfaces.Binding<T>, request: interfaces.Request): T | Promise<T> | null {
    if(this.resolveScope){
      return this.resolveScope.get(binding, request);
    }
    this.throwNotConfigured();
  }
  set(binding: interfaces.Binding<T>, request: interfaces.Request, resolved: T | Promise<T>): T | Promise<T> {
    if(this.resolveScope){
      return this.resolveScope.set(binding, request, resolved);
    }
    this.throwNotConfigured();
  }
  clone(): interfaces.ScopeManager<T> {
    const clone = new ScopeManager<T>();
    clone.scope = this.scope;
    if(this.resolveScope){
      clone.resolveScope = this.resolveScope.clone();
    }
    return clone;
  }
  setScope(scope:interfaces.BindingScope): void{
    this.scope = scope;
    this.resolveScope = this.scopeFactory.get(scope);
  }
  private throwNotConfigured():never{
    throw new Error(ERROR_MSGS.SCOPE_NOT_CONFIGURED);
  }
}