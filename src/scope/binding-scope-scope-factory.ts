import { interfaces } from "../interfaces/interfaces";
import { BindingScopeEnum } from "../inversify";
import { RequestResolveScope } from "./request-resolve-scope";
import { RootRequestScope } from "./root-request-scope";
import { SingletonScope } from "./singleton-scope";
import { TransientScope } from "./transient-scope";
import { BindingScopeScope, BindingScopeScopeFactory as BindingScopeScopeFactoryInterface} from "./binding-scope-scope-factory-interface"

const transientScope = new TransientScope<any>();
const requestScope = new RequestResolveScope<any>();
const rootRequestScope = new RootRequestScope<any>();

export class BindingScopeScopeFactory<T> implements BindingScopeScopeFactoryInterface<T>{
  get(scope: interfaces.BindingScope): BindingScopeScope<T> {
    let resolveScope:BindingScopeScope<T> = transientScope;
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