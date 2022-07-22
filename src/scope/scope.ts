import { BindingScopeEnum, interfaces } from '../inversify';
import { isPromise } from '../utils/async';

export const tryGetFromScope = <T>(
  requestScope: interfaces.RequestScope,
  binding: interfaces.Binding<T>
): T | Promise<T> | null => {

  if ((binding.scope === BindingScopeEnum.Singleton) && binding.activated) {
    return binding.cache!;
  }

  if (
    binding.scope === BindingScopeEnum.Request &&
    requestScope.has(binding.id)
  ) {
    return requestScope.get(binding.id) as T | Promise<T>;
  }
  return null;
}

export const saveToScope = <T>(
  requestScope: interfaces.RequestScope,
  binding: interfaces.Binding<T>,
  result: T | Promise<T>
): void => {
  if (binding.scope === BindingScopeEnum.Singleton) {
    _saveToSingletonScope(binding, result);
  }

  if (
    binding.scope === BindingScopeEnum.Request
  ) {
    _saveToRequestScope(requestScope, binding, result);
  }
}

const _saveToRequestScope = <T>(
  requestScope: interfaces.RequestScope,
  binding: interfaces.Binding<T>,
  result: T | Promise<T>
): void => {
  if (
    !requestScope.has(binding.id)
  ) {
    requestScope.set(binding.id, result);
  }
}

const _saveToSingletonScope = <T>(
  binding: interfaces.Binding<T>,
  result: T | Promise<T>
): void => {
  // store in cache if scope is singleton
  binding.cache = result;
  binding.activated = true;

  if (isPromise(result)) {
    void _saveAsyncResultToSingletonScope(binding, result);
  }
}

const _saveAsyncResultToSingletonScope = async <T>(
  binding: interfaces.Binding<T>,
  asyncResult: Promise<T>
): Promise<void> => {
  try {
    const result = await asyncResult;

    binding.cache = result;
  } catch (ex: unknown) {
    // allow binding to retry in future
    binding.cache = null;
    binding.activated = false;

    throw ex;
  }
}
