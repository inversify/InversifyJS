import { interfaces } from "../interfaces/interfaces";
import { BindingScopeEnum } from "../inversify";
import { RequestResolveScope } from "./RequestResolveScope";
import { SingletonScope } from "./SingletonScope";
import { TransientScope } from "./TransientScope";

const transientScope = new TransientScope<any>();
const requestScope = new RequestResolveScope<any>();

export class ResolveScopeFactory<T> implements interfaces.ResolveScopeFactory<T>{
  get(scope: interfaces.BindingScope): interfaces.Scope<T> {
    let resolveScope:interfaces.Scope<T> = transientScope;
    switch(scope){
      case BindingScopeEnum.Singleton:
        resolveScope = new SingletonScope();
        break;
      case BindingScopeEnum.Request:
        resolveScope = requestScope;
        break;
    }
    return resolveScope;
  }

}