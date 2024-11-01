import { BindingScopeEnum } from '../constants/literal_types';
import type { interfaces } from '../interfaces/interfaces';
import { isPromise } from '../utils/async';

export const tryGetFromScope: <T>(
  requestScope: interfaces.RequestScope,
  binding: interfaces.Binding<T>,
) => T | Promise<T> | null = <T>(
  requestScope: interfaces.RequestScope,
  binding: interfaces.Binding<T>,
): T | Promise<T> | null => {
  if (binding.scope === BindingScopeEnum.Singleton && binding.activated) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return binding.cache!;
  }

  if (
    binding.scope === BindingScopeEnum.Request &&
    requestScope.has(binding.id)
  ) {
    return requestScope.get(binding.id) as T | Promise<T>;
  }
  return null;
};

export const saveToScope: <T>(
  requestScope: interfaces.RequestScope,
  binding: interfaces.Binding<T>,
  result: T | Promise<T>,
) => void = <T>(
  requestScope: interfaces.RequestScope,
  binding: interfaces.Binding<T>,
  result: T | Promise<T>,
): void => {
  if (binding.scope === BindingScopeEnum.Singleton) {
    _saveToSingletonScope(binding, result);
  }

  if (binding.scope === BindingScopeEnum.Request) {
    _saveToRequestScope(requestScope, binding, result);
  }
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _saveToRequestScope: <T>(
  requestScope: interfaces.RequestScope,
  binding: interfaces.Binding<T>,
  result: T | Promise<T>,
) => void = <T>(
  requestScope: interfaces.RequestScope,
  binding: interfaces.Binding<T>,
  result: T | Promise<T>,
): void => {
  if (!requestScope.has(binding.id)) {
    requestScope.set(binding.id, result);
  }
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _saveToSingletonScope: <T>(
  binding: interfaces.Binding<T>,
  result: T | Promise<T>,
) => void = <T>(
  binding: interfaces.Binding<T>,
  result: T | Promise<T>,
): void => {
  // store in cache if scope is singleton
  binding.cache = result;
  binding.activated = true;

  if (isPromise(result)) {
    void _saveAsyncResultToSingletonScope(binding, result);
  }
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _saveAsyncResultToSingletonScope: <T>(
  binding: interfaces.Binding<T>,
  asyncResult: Promise<T>,
) => Promise<void> = async <T>(
  binding: interfaces.Binding<T>,
  asyncResult: Promise<T>,
): Promise<void> => {
  try {
    const result: Awaited<T> = await asyncResult;

    binding.cache = result;
  } catch (ex: unknown) {
    // allow binding to retry in future
    binding.cache = null;
    binding.activated = false;

    throw ex;
  }
};
