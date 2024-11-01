import * as ERROR_MSGS from '../constants/error_msgs';
import { BindingTypeEnum } from '../constants/literal_types';
import { interfaces } from '../interfaces/interfaces';
import { getBindingDictionary } from '../planning/planner';
import { saveToScope, tryGetFromScope } from '../scope/scope';
import { isPromise } from '../utils/async';
import { ensureFullyBound, getFactoryDetails } from '../utils/binding_utils';
import { tryAndThrowErrorIfStackOverflow } from '../utils/exceptions';
import { resolveInstance } from './instantiation';

// eslint-disable-next-line @typescript-eslint/naming-convention
const _resolveRequest: <T>(
  requestScope: interfaces.RequestScope,
) => (
  request: interfaces.Request,
) => undefined | T | Promise<T> | (T | Promise<T>)[] =
  <T>(requestScope: interfaces.RequestScope) =>
  (
    request: interfaces.Request,
  ): undefined | T | Promise<T> | (T | Promise<T>)[] => {
    request.parentContext.setCurrentRequest(request);

    const bindings: interfaces.Binding[] = request.bindings;
    const childRequests: interfaces.Request[] = request.childRequests;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
    const targetIsAnArray: boolean = request.target && request.target.isArray();

    const targetParentIsNotAnArray: boolean =
      !request.parentRequest ||
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
      !request.parentRequest.target ||
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
      !request.target ||
      !request.parentRequest.target.matchesArray(
        request.target.serviceIdentifier,
      );

    if (targetIsAnArray && targetParentIsNotAnArray) {
      // Create an array instead of creating an instance
      return childRequests.map(
        (childRequest: interfaces.Request): T | Promise<T> => {
          const resolveRequest: (request: interfaces.Request) => unknown =
            _resolveRequest(requestScope);
          return resolveRequest(childRequest) as T | Promise<T>;
        },
      );
    } else {
      if (request.target.isOptional() && bindings.length === 0) {
        return undefined;
      }

      const binding: interfaces.Binding | undefined = bindings[0];

      return _resolveBinding<T>(
        requestScope,
        request,
        binding as interfaces.Binding as interfaces.Binding<T>,
      );
    }
  };

// eslint-disable-next-line @typescript-eslint/naming-convention
const _resolveFactoryFromBinding: <T>(
  binding: interfaces.Binding<T>,
  context: interfaces.Context,
) => T | Promise<T> = <T>(
  binding: interfaces.Binding<T>,
  context: interfaces.Context,
): T | Promise<T> => {
  const factoryDetails: interfaces.FactoryDetails = getFactoryDetails(binding);
  return tryAndThrowErrorIfStackOverflow(
    (): T | Promise<T> =>
      (factoryDetails.factory as interfaces.FactoryTypeFunction<T>).bind(
        binding,
      )(context),
    () =>
      new Error(
        ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY(
          factoryDetails.factoryType,
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          context.currentRequest.serviceIdentifier.toString(),
        ),
      ),
  );
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _getResolvedFromBinding: <T = unknown>(
  requestScope: interfaces.RequestScope,
  request: interfaces.Request,
  binding: interfaces.Binding<T>,
) => T | Promise<T> = <T = unknown>(
  requestScope: interfaces.RequestScope,
  request: interfaces.Request,
  binding: interfaces.Binding<T>,
): T | Promise<T> => {
  let result: T | Promise<T> | undefined;
  const childRequests: interfaces.Request[] = request.childRequests;

  ensureFullyBound(binding);

  switch (binding.type) {
    case BindingTypeEnum.ConstantValue:
    case BindingTypeEnum.Function:
      result = binding.cache as T | Promise<T>;
      break;
    case BindingTypeEnum.Constructor:
      result = binding.implementationType as T;
      break;
    case BindingTypeEnum.Instance:
      result = resolveInstance<T>(
        binding,
        binding.implementationType as interfaces.Newable<T>,
        childRequests,
        _resolveRequest<T>(requestScope),
      );
      break;
    default:
      result = _resolveFactoryFromBinding(binding, request.parentContext);
  }

  return result;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _resolveInScope: <T>(
  requestScope: interfaces.RequestScope,
  binding: interfaces.Binding<T>,
  resolveFromBinding: () => T | Promise<T>,
) => T | Promise<T> = <T>(
  requestScope: interfaces.RequestScope,
  binding: interfaces.Binding<T>,
  resolveFromBinding: () => T | Promise<T>,
): T | Promise<T> => {
  let result: T | Promise<T> | null = tryGetFromScope<T>(requestScope, binding);
  if (result !== null) {
    return result;
  }
  result = resolveFromBinding();
  saveToScope(requestScope, binding, result);
  return result;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _resolveBinding: <T>(
  requestScope: interfaces.RequestScope,
  request: interfaces.Request,
  binding: interfaces.Binding<T>,
) => T | Promise<T> = <T>(
  requestScope: interfaces.RequestScope,
  request: interfaces.Request,
  binding: interfaces.Binding<T>,
): T | Promise<T> => {
  return _resolveInScope<T>(requestScope, binding, (): T | Promise<T> => {
    let result: T | Promise<T> = _getResolvedFromBinding(
      requestScope,
      request,
      binding,
    );
    if (isPromise(result)) {
      result = result.then((resolved: T): T | Promise<T> =>
        _onActivation(request, binding, resolved),
      );
    } else {
      result = _onActivation<T>(request, binding, result);
    }
    return result;
  });
};

function _onActivation<T>(
  request: interfaces.Request,
  binding: interfaces.Binding<T>,
  resolved: T,
): T | Promise<T> {
  let result: T | Promise<T> = _bindingActivation(
    request.parentContext,
    binding,
    resolved,
  );

  const containersIterator: Iterator<interfaces.Container> =
    _getContainersIterator(request.parentContext.container);

  let container: interfaces.Container;
  let containersIteratorResult: IteratorResult<interfaces.Container> =
    containersIterator.next();

  do {
    container = containersIteratorResult.value as interfaces.Container;
    const context: interfaces.Context = request.parentContext;
    const serviceIdentifier: interfaces.ServiceIdentifier =
      request.serviceIdentifier;
    const activationsIterator: ArrayIterator<interfaces.BindingActivation> =
      _getContainerActivationsForService(container, serviceIdentifier);

    if (isPromise(result)) {
      result = _activateContainerAsync<T>(
        activationsIterator as Iterator<interfaces.BindingActivation<T>>,
        context,
        result,
      );
    } else {
      result = _activateContainer<T>(
        activationsIterator as Iterator<interfaces.BindingActivation<T>>,
        context,
        result,
      );
    }

    containersIteratorResult = containersIterator.next();

    // make sure if we are currently on the container that owns the binding, not to keep looping down to child containers
  } while (
    containersIteratorResult.done !== true &&
    !getBindingDictionary(container).hasKey(request.serviceIdentifier)
  );

  return result;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const _bindingActivation: <T>(
  context: interfaces.Context,
  binding: interfaces.Binding<T>,
  previousResult: T,
) => T | Promise<T> = <T>(
  context: interfaces.Context,
  binding: interfaces.Binding<T>,
  previousResult: T,
): T | Promise<T> => {
  let result: T | Promise<T>;

  // use activation handler if available
  if (typeof binding.onActivation === 'function') {
    result = binding.onActivation(context, previousResult);
  } else {
    result = previousResult;
  }

  return result;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _activateContainer: <T>(
  activationsIterator: Iterator<interfaces.BindingActivation<T>>,
  context: interfaces.Context,
  result: T,
) => T | Promise<T> = <T>(
  activationsIterator: Iterator<interfaces.BindingActivation<T>>,
  context: interfaces.Context,
  result: T,
): T | Promise<T> => {
  let activation: IteratorResult<interfaces.BindingActivation<T>> =
    activationsIterator.next();

  while (activation.done !== true) {
    result = activation.value(context, result) as T;

    if (isPromise<T>(result)) {
      return _activateContainerAsync(activationsIterator, context, result);
    }

    activation = activationsIterator.next();
  }

  return result;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _activateContainerAsync: <T>(
  activationsIterator: Iterator<interfaces.BindingActivation<T>>,
  context: interfaces.Context,
  resultPromise: Promise<T>,
) => Promise<T> = async <T>(
  activationsIterator: Iterator<interfaces.BindingActivation<T>>,
  context: interfaces.Context,
  resultPromise: Promise<T>,
): Promise<T> => {
  let result: Awaited<T> = await resultPromise;
  let activation: IteratorResult<interfaces.BindingActivation<T>> =
    activationsIterator.next();

  while (activation.done !== true) {
    result = await activation.value(context, result);

    activation = activationsIterator.next();
  }

  return result;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _getContainerActivationsForService: <T>(
  container: interfaces.Container,
  serviceIdentifier: interfaces.ServiceIdentifier<T>,
) => ArrayIterator<interfaces.BindingActivation<unknown>> = <T>(
  container: interfaces.Container,
  serviceIdentifier: interfaces.ServiceIdentifier<T>,
) => {
  // smell accessing _activations, but similar pattern is done in planner.getBindingDictionary()
  const activations: interfaces.Lookup<interfaces.BindingActivation> = (
    container as unknown as {
      _activations: interfaces.Lookup<interfaces.BindingActivation<unknown>>;
    }
  )._activations;

  return activations.hasKey(serviceIdentifier)
    ? activations.get(serviceIdentifier).values()
    : [].values();
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _getContainersIterator: (
  container: interfaces.Container,
) => Iterator<interfaces.Container> = (
  container: interfaces.Container,
): Iterator<interfaces.Container> => {
  const containersStack: interfaces.Container[] = [container];

  let parent: interfaces.Container | null = container.parent;

  while (parent !== null) {
    containersStack.push(parent);

    parent = parent.parent;
  }

  const getNextContainer: () => IteratorResult<interfaces.Container> = () => {
    const nextContainer: interfaces.Container | undefined =
      containersStack.pop();

    if (nextContainer !== undefined) {
      return { done: false, value: nextContainer };
    } else {
      return { done: true, value: undefined };
    }
  };

  const containersIterator: Iterator<interfaces.Container> = {
    next: getNextContainer,
  };

  return containersIterator;
};

function resolve<T>(
  context: interfaces.Context,
): T | Promise<T> | (T | Promise<T>)[] {
  const resolveRequestFunction: (
    request: interfaces.Request,
  ) => T | Promise<T> | (T | Promise<T>)[] | undefined = _resolveRequest<T>(
    context.plan.rootRequest.requestScope as interfaces.RequestScope,
  );

  return resolveRequestFunction(context.plan.rootRequest) as
    | T
    | Promise<T>
    | (T | Promise<T>)[];
}

export { resolve };
