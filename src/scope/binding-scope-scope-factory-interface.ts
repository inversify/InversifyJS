import { interfaces } from "../interfaces/interfaces";

type BindingScopeScope<T> = Exclude<interfaces.ResolveScope<T>,interfaces.CustomScope<T>>;
export interface BindingScopeScopeFactory<T>{
  get(scope:interfaces.BindingScope):BindingScopeScope<T>
}