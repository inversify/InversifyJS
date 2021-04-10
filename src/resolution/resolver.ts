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

        if (isPromise(result)) {
            result = result.then((resolved) => _onActivation(request, binding, resolved));
        } else {
            result = _onActivation(request, binding, result);
        }

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

function _onActivation<T>(request: interfaces.Request, binding: interfaces.Binding<T>, previousResult: T): T | Promise<T> {
    let result = _callBindingActivation(request, binding, previousResult);

    const containersIterator = _getParentContainersIterator(request.parentContext.container, true);

    let container: interfaces.Container;
    let containersIteratorResult = containersIterator.next();

    do {
        container = containersIteratorResult.value;

        if (isPromise(result)) {
            result = _callContainerActivationsAsync<T>(request, container, result);
        } else {
            result = _callContainerActivations<T>(request, container, result);
        }

        containersIteratorResult = containersIterator.next();

        // make sure if we are currently on the container that owns the binding, not to keep looping down to child containers
    } while (containersIteratorResult.done !== true && !getBindingDictionary(container).hasKey(request.serviceIdentifier));

    return result;
}

const _callBindingActivation = <T>(request: interfaces.Request, binding: interfaces.Binding<T>, previousResult: T): T | Promise<T> => {
    let result: T | Promise<T>;

    // use activation handler if available
    if (typeof binding.onActivation === "function") {
        result = binding.onActivation(request.parentContext, previousResult);
    } else {
        result = previousResult;
    }

    return result;
}

const _callActivations = <T> (
    activationsIterator: Iterator<interfaces.BindingActivation<any>>,
    context: interfaces.Context,
    result: T,
): T | Promise<T> => {
    let activation = activationsIterator.next();

    while (!activation.done) {
        result = activation.value(context, result);

        if (isPromise(result)) {
            return result.then((resolved) => _callActivationsAsync(activationsIterator, context, resolved));
        }

        activation = activationsIterator.next();
    }

    return result;
}

const _callActivationsAsync = async<T>(
    activationsIterator: Iterator<interfaces.BindingActivation<any>>,
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

const _callContainerActivations = <T>(
    request: interfaces.Request,
    container: interfaces.Container,
    previousResult: T,
): T | Promise<T> => {
    const context = request.parentContext;
    const serviceIdentifier = request.serviceIdentifier;

    const activationsIterator = _extractActivationsForService(container, serviceIdentifier);

    const activationsTraverseResult = _callActivations(activationsIterator, context, previousResult);

    return activationsTraverseResult;
}

const _callContainerActivationsAsync = async <T>(
    request: interfaces.Request,
    container: interfaces.Container,
    previousResult: T | Promise<T>,
): Promise<T> => {
    const context = request.parentContext;
    const serviceIdentifier = request.serviceIdentifier;

    const activationsIterator = _extractActivationsForService(container, serviceIdentifier);

    return _callActivationsAsync(activationsIterator, context, await previousResult);
}

const _extractActivationsForService = <T>(container: interfaces.Container, serviceIdentifier: interfaces.ServiceIdentifier<T>) => {
    // smell accessing _activations, but similar pattern is done in planner.getBindingDictionary()
    const activations = (container as any)._activations as interfaces.Lookup<interfaces.BindingActivation<any>>;

    return activations.hasKey(serviceIdentifier) ? activations.get(serviceIdentifier).values() : [].values();
}

const _getParentContainersIterator = (container: interfaces.Container, includeSelf: boolean = false): Iterator<interfaces.Container> => {
    const containersStack: interfaces.Container[] = [];

    if (includeSelf) {
        containersStack.push(container);
    }

    let parent = container.parent;

    while (parent !== null) {
        containersStack.push(parent);

        parent = parent.parent;
    }

    const getNextContainer: () => IteratorResult<interfaces.Container> = () => {
        const nextContainer = containersStack.pop();

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
}

function resolve<T>(context: interfaces.Context): T {
    const _f = _resolveRequest(context.plan.rootRequest.requestScope);
    return _f(context.plan.rootRequest);
}

export { resolve };
