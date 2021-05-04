import { interfaces } from "../interfaces/interfaces";
import { RequestResolveScope } from "./RequestResolveScope";
import { SingletonScope } from "./SingletonScope";
import { TransientScope } from "./TransientScope";

const transientScope = new TransientScope<any>();
const requestScope = new RequestResolveScope<any>();

export function getResolveScope<T>(scope:interfaces.BindingScope): interfaces.Scope<T>{
  switch(scope){
      case "Singleton":
        return new SingletonScope();
      case "Transient":
        return transientScope;
      case "Request":
          return requestScope;
  }
}