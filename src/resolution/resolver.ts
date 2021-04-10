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

        result = _onActivation(request, binding, result);

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

function _onActivation<T>(request: interfaces.Request, binding: interfaces.Binding<T>, resolved: T | Promise<T>): T | Promise<T> {
    if (isPromise(resolved)) {
        return resolved.then((unpromised) => _onActivation(request, binding, unpromised));
    }

    let result: T | Promise<T>;

    // use activation handler if available
    if (typeof binding.onActivation === "function") {
        result = binding.onActivation(request.parentContext, resolved);
    } else {
        result = resolved;
    }

    const containers = [request.parentContext.container];

    let parent = request.parentContext.container.parent;

    while (parent) {
        containers.unshift(parent);

        parent = parent.parent;
    }

    const containersIterator = containers.values();

    if (isPromise(result)) {
        return result.then(() => _activationLoop(
            request.parentContext,
            containersIterator.next().value,
            containersIterator,
            request.serviceIdentifier,
            result,
        ));
    } else {
        return _activationLoop(
            request.parentContext,
            containersIterator.next().value,
            containersIterator,
            request.serviceIdentifier,
            result,
        );
    }
}

function _activationLoop<T>(
    context: interfaces.Context,
    container: interfaces.Container,
    containersIterator: IterableIterator<interfaces.Container>,
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
    previousResult: T | Promise<T>,
): T | Promise<T> {
    if (isPromise(previousResult)) {
        return previousResult.then(
            (unpromised) => _activationLoop(context, container, containersIterator, serviceIdentifier, unpromised),
        );
    }

    const activationsIterator = _extractActivationsFromService(container, serviceIdentifier);

    const activationsTraverseResult = _traverseActivations(activationsIterator, context, previousResult);

    if (isPromise(activationsTraverseResult)) {
        return activationsTraverseResult.then((result: T) => {
            return _traverseChildContainerActivations(
                context,
                container,
                containersIterator,
                serviceIdentifier,
                result,
            );
        });
    }

    return _traverseChildContainerActivations(
        context,
        container,
        containersIterator,
        serviceIdentifier,
        activationsTraverseResult,
    );
}

const _extractActivationsFromService = <T>(container: interfaces.Container, serviceIdentifier: interfaces.ServiceIdentifier<T>) => {
    // smell accessing _activations, but similar pattern is done in planner.getBindingDictionary()
    const activations = (container as any)._activations as interfaces.Lookup<interfaces.BindingActivation<any>>;

    return activations.hasKey(serviceIdentifier) ? activations.get(serviceIdentifier).values() : [].values();
}

const _traverseActivations = <T> (
    activationsIterator: IterableIterator<interfaces.BindingActivation<any>>,
    context: interfaces.Context,
    result: T,
): T | Promise<T> => {
    let activation = activationsIterator.next();

    while (!activation.done) {
        result = activation.value(context, result);

        if (isPromise(result)) {
            return _traverseActivationsAsync(activationsIterator, context, result);
        }

        activation = activationsIterator.next();
    }

    return result;
}

const _traverseActivationsAsync = async<T>(
    activationsIterator: IterableIterator<interfaces.BindingActivation<any>>,
    context: interfaces.Context,
    result: T,
): Promise<T> => {
    let activation = activationsIterator.next();

    while (!activation.done) {
      result = await activation.value(context, result);

      activation = activationsIterator.next();
    }

    return result;
}

const _traverseChildContainerActivations = <T>(
    context: interfaces.Context,
    container: interfaces.Container,
    containersIterator: IterableIterator<interfaces.Container>,
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
    result : T,
):  T | Promise<T> => {
    const nextContainer = containersIterator.next();

    if (nextContainer.value && !getBindingDictionary(container).hasKey(serviceIdentifier)) {
        // make sure if we are currently on the container that owns the binding, not to keep looping down to child containers
        return _activationLoop(context, nextContainer.value, containersIterator, serviceIdentifier, result);
    }

    return result;
};

function resolve<T>(context: interfaces.Context): T {
    const _f = _resolveRequest(context.plan.rootRequest.requestScope);
    return _f(context.plan.rootRequest);
}

export { resolve };
