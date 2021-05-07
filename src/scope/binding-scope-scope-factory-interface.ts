import { interfaces } from "../interfaces/interfaces";

export interface BindingScopeScopeFactory<T>{
  get(scope:interfaces.BindingScope):interfaces.BindingScopeScope<T>
}