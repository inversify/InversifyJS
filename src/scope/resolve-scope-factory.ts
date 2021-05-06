import { interfaces } from "../interfaces/interfaces";
import { BindingScopeEnum } from "../inversify";
import { RequestResolveScope } from "./request-resolve-scope";
import { RootRequestScope } from "./root-request-scope";
import { SingletonScope } from "./singleton-scope";
import { TransientScope } from "./transient-scope";
import { ResolveScopeFactory as ResolveScopeFactoryInterface} from "./resolve-scope-factory-interface"

const transientScope = new TransientScope<any>();
const requestScope = new RequestResolveScope<any>();
const rootRequestScope = new RootRequestScope<any>();

export class ResolveScopeFactory<T> implements ResolveScopeFactoryInterface<T>{
  get(scope: interfaces.BindingScope): interfaces.Scope<T> {
    let resolveScope:interfaces.Scope<T> = transientScope;
    switch(scope){
      case BindingScopeEnum.Singleton:
        resolveScope = new SingletonScope();
        break;
      case BindingScopeEnum.Request:
        resolveScope = requestScope;
        break;
      case BindingScopeEnum.RootRequest:
        resolveScope = rootRequestScope;
    }
    return resolveScope;
  }

}