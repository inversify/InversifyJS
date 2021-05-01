import { BindingScopeEnum, interfaces } from "../inversify";
import { isPromise } from "../utils/async";

export const _tryGetFromScope = <T>(
  requestScope: interfaces.RequestScope,
  binding:interfaces.Binding<T>): T | Promise<T> | null => {

  if ((binding.scope === BindingScopeEnum.Singleton) && binding.activated) {
      return binding.cache!;
  }

  if (
      binding.scope === BindingScopeEnum.Request &&
      requestScope !== null &&
      requestScope.has(binding.id)
  ) {
      return requestScope.get(binding.id);
  }
  return null;
}

export const _saveToScope = <T>(
  requestScope: interfaces.RequestScope,
  binding:interfaces.Binding<T>,
  result:T | Promise<T>
): void => {
  // store in cache if scope is singleton
  if (binding.scope === BindingScopeEnum.Singleton) {
      binding.cache = result;
      binding.activated = true;

      if (isPromise(result)) {
          result.catch((ex) => {
              // allow binding to retry in future
              binding.cache = null;
              binding.activated = false;

              throw ex;
          });
      }
  }

  if (
      binding.scope === BindingScopeEnum.Request &&
      requestScope !== null &&
      !requestScope.has(binding.id)
  ) {
      requestScope.set(binding.id, result);
  }
}
