import * as ERROR_MSGS from "../constants/error_msgs";
import { BindingScopeEnum, BindingTypeEnum } from "../constants/literal_types";
import { interfaces } from "../interfaces/interfaces";
import { getBindingDictionary } from "../planning/planner";
import { isPromise } from "../utils/async";
import { isStackOverflowExeption } from "../utils/exceptions";
import { getServiceIdentifierAsString } from "../utils/serialization";
import { resolveInstance } from "./instantiation";

type FactoryType = "toDynamicValue" | "toFactory" | "toAutoFactory" | "toProvider";

const invokeFactory = (
    factoryType: FactoryType,
    serviceIdentifier: interfaces.ServiceIdentifier<any>,
    fn: () => any
) => {
    try {
        return fn();
    } catch (error) {
        if (isStackOverflowExeption(error)) {
            throw new Error(
                ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY(factoryType, serviceIdentifier.toString())
            );
        } else {
            throw error;
        }
    }
};

const _resolveRequest = (requestScope: interfaces.RequestScope) =>
    (request: interfaces.Request): any => {

    request.parentContext.setCurrentRequest(request);

    const bindings = request.bindings;
    const childRequests = request.childRequests;

    const targetIsAnArray = request.target && request.target.isArray();

    const targetParentIsNotAnArray = !request.parentRequest ||
                                   !request.parentRequest.target ||
                                   !request.target ||
                                   !request.parentRequest.target.matchesArray(request.target.serviceIdentifier);

    if (targetIsAnArray && targetParentIsNotAnArray) {

        // Create an array instead of creating an instance
        return childRequests.map((childRequest: interfaces.Request) => {
            const _f = _resolveRequest(requestScope);
            return _f(childRequest);
        });

    } else {

        let result: any = null;

        if (request.target.isOptional() && bindings.length === 0) {
            return undefined;
        }

        const binding = bindings[0];
        const isSingleton = binding.scope === BindingScopeEnum.Singleton;
        const isRequestSingleton = binding.scope === BindingScopeEnum.Request;

        if (isSingleton && binding.activated) {
            return binding.cache;
        }

        if (
            isRequestSingleton &&
            requestScope !== null &&
            requestScope.has(binding.id)
        ) {
            return requestScope.get(binding.id);
        }

        if (binding.type === BindingTypeEnum.ConstantValue) {
            result = binding.cache;
            binding.activated = true;
        } else if (binding.type === BindingTypeEnum.Function) {
            result = binding.cache;
            binding.activated = true;
        } else if (binding.type === BindingTypeEnum.Constructor) {
            result = binding.implementationType;
        } else if (binding.type === BindingTypeEnum.DynamicValue && binding.dynamicValue !== null) {
            result = invokeFactory(
                "toDynamicValue",
                binding.serviceIdentifier,
                () => (binding.dynamicValue as (context: interfaces.Context) => any)(request.parentContext)
            );
        } else if (binding.type === BindingTypeEnum.Factory && binding.factory !== null) {
            result = invokeFactory(
                "toFactory",
                binding.serviceIdentifier,
                () => (binding.factory as interfaces.FactoryCreator<any>)(request.parentContext)
            );
        } else if (binding.type === BindingTypeEnum.Provider && binding.provider !== null) {
            result = invokeFactory(
                "toProvider",
                binding.serviceIdentifier,
                () => (binding.provider as interfaces.Provider<any>)(request.parentContext)
            );
        } else if (binding.type === BindingTypeEnum.Instance && binding.implementationType !== null) {
            result = resolveInstance(
                binding,
                binding.implementationType,
                childRequests,
                _resolveRequest(requestScope)
            );
        } else {
            // The user probably created a binding but didn't finish it
            // e.g. container.bind<T>("Something"); missing BindingToSyntax
            const serviceIdentifier = getServiceIdentifierAsString(request.serviceIdentifier);
            throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifier}`);
        }

        result = onActivation(request, binding, result);

        // store in cache if scope is singleton
        if (isSingleton) {
            binding.cache = result;
            binding.activated = true;

            if (isPromise(result)) {
              result = result.catch((ex) => {
                    // allow binding to retry in future
                    binding.cache = null;
                    binding.activated = false;

                    throw ex;
                });
            }
        }

        if (
            isRequestSingleton &&
            requestScope !== null &&
            !requestScope.has(binding.id)
        ) {
            requestScope.set(binding.id, result);
        }

        return result;
    }

};

function onActivation<T>(request: interfaces.Request, binding: interfaces.Binding<T>, resolved: T | Promise<T>): T | Promise<T> {
  if (isPromise(resolved)) {
    return resolved.then((unpromised) => onActivation(request, binding, unpromised));
  }

  let result: T | Promise<T> = resolved;

  // use activation handler if available
  if (typeof binding.onActivation === "function") {
    result = binding.onActivation(request.parentContext, result as T);
  }

  const containers = [request.parentContext.container];

  let parent = request.parentContext.container.parent;

  while (parent) {
    containers.unshift(parent);

    parent = parent.parent;
  }

  const iter = containers.entries();

  return activationLoop(request.parentContext, iter.next().value[1], iter, binding, request.serviceIdentifier, result);
}

function activationLoop<T>(
    context: interfaces.Context,
    container: interfaces.Container,
    containerIterator: IterableIterator<[number, interfaces.Container]>,
    binding: interfaces.Binding<T>,
    identifier: interfaces.ServiceIdentifier<T>,
    previous: T | Promise<T>,
    iterator?: IterableIterator<[number, interfaces.BindingActivation<any>]>
  ): T | Promise<T> {
    if (isPromise(previous)) {
        return previous.then((unpromised) => activationLoop(context, container, containerIterator, binding, identifier, unpromised));
    }

    let result = previous;

    let iter = iterator;

    if (!iter) {
      // smell accessing _activations, but similar pattern is done in planner.getBindingDictionary()
      const activations = (container as any)._activations as interfaces.Lookup<interfaces.BindingActivation<any>>;

      iter = activations.hasKey(identifier) ? activations.get(identifier).entries() : [].entries();
    }

    let next = iter.next();

    while (!next.done) {
      result = next.value[1](context, result);

      if (isPromise(result)) {
          return result.then((unpromised) => activationLoop(context, container, containerIterator, binding, identifier, unpromised, iter));
      }

      next = iter.next();
    }

    const nextContainer = containerIterator.next();

    if (nextContainer.value && !getBindingDictionary(container).hasKey(identifier)) {
      // make sure if we are currently on the container that owns the binding, not to keep looping down to child containers
      return activationLoop(context, nextContainer.value[1], containerIterator, binding, identifier, result);
    }

    return result;
  }

function resolve<T>(context: interfaces.Context): T {
    const _f = _resolveRequest(context.plan.rootRequest.requestScope);
    return _f(context.plan.rootRequest);
}

export { resolve };
