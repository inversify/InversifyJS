import { interfaces } from "../interfaces/interfaces";

export interface ResolveScopeFactory<T>{
  get(scope:interfaces.BindingScope):interfaces.Scope<T>
}