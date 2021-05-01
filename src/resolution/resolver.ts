import * as ERROR_MSGS from "../constants/error_msgs";
import { interfaces } from "../interfaces/interfaces";
import { getBindingDictionary } from "../planning/planner";
import { _saveToScope, _tryGetFromScope } from "../scope/scope";
import { isPromise } from "../utils/async";
import { __ensureFullyBound } from "../utils/binding_utils";
import { isStackOverflowExeption } from "../utils/exceptions";
import { resolveInstance } from "./instantiation";

type FactoryType = "toDynamicValue" | "toFactory" | "toAutoFactory" | "toProvider";
type FactoryTypeFunction = (context: interfaces.Context) => any;

const _resolveRequest = <T>(requestScope: interfaces.RequestScope) =>
    (request: interfaces.Request): undefined | T | Promise<T> | (T | Promise<T>)[] => {

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
            return _f(childRequest) as T | Promise<T>;
        });

    } else {
        if (request.target.isOptional() && bindings.length === 0) {
            return undefined;
        }

        const binding = bindings[0];

        return _resolveBinding<T>(requestScope, request, binding);
    }
};

const _resolveFactoryFromBinding = <T>(
    factory:FactoryTypeFunction, factoryType:FactoryType, context:interfaces.Context
): T => {
    const serviceIdentifier = context.currentRequest.serviceIdentifier
    try {
        return factory(context);
    } catch (error) {
        if (isStackOverflowExeption(error)) {
            throw new Error(
                ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY(factoryType, serviceIdentifier.toString())
            );
        } else {
            throw error;
        }
    }
}

const _getResolvedFromBinding = <T>(
    requestScope: interfaces.RequestScope,
    request: interfaces.Request,
    binding:interfaces.Binding<T>): T | Promise<T> => {
    let result: T | Promise<T> | undefined;
    const childRequests = request.childRequests;
    const context = request.parentContext;
    __ensureFullyBound(binding);
    switch(binding.type){
        case "ConstantValue":
        case "Function":
            result = binding.cache as T | Promise<T>;
            binding.activated = true;
            break;
        case "Constructor":
            result = binding.implementationType as T;
            break;
        case "Instance":
            result = resolveInstance<T>(
                binding,
                binding.implementationType as interfaces.Newable<T>,
                childRequests,
                _resolveRequest<T>(requestScope)
            );
            break;
        case "Factory":
            result = _resolveFactoryFromBinding(binding.factory as FactoryTypeFunction,"toFactory",context);
            break;
        case "Provider":
            result = _resolveFactoryFromBinding(binding.provider as FactoryTypeFunction,"toProvider",context);
            break;
        case "DynamicValue":
            result = _resolveFactoryFromBinding(binding.dynamicValue as FactoryTypeFunction,"toDynamicValue",context);
            break;
    }
    return result as T | Promise<T>;
}
const _resolveInScope = <T>(
    requestScope: interfaces.RequestScope,
    binding:interfaces.Binding<T>,
    resolveFromBinding: () => T | Promise<T>
): T | Promise<T> => {
    let result = _tryGetFromScope(requestScope,binding);
    if(result !== null){
        return result;
    }
    result = resolveFromBinding();
    _saveToScope(requestScope,binding, result);
    return result;
}

const _resolveBinding = <T>(
    requestScope: interfaces.RequestScope,
    request: interfaces.Request,
    binding:interfaces.Binding<T>,
): T | Promise<T> => {
    return _resolveInScope(requestScope,binding, () => {
        let result = _getResolvedFromBinding<T>(requestScope, request, binding);
        if (isPromise(result)) {
            result = result.then((resolved) => _onActivation(request, binding, resolved));
        } else {
            result = _onActivation<T>(request, binding, result);
        }
        return result;
    })
}

function _onActivation<T>(request: interfaces.Request, binding: interfaces.Binding<T>, resolved: T): T | Promise<T> {
    let result = _bindingActivation(request.parentContext, binding, resolved);

    const containersIterator = _getContainersIterator(request.parentContext.container);

    let container: interfaces.Container;
    let containersIteratorResult = containersIterator.next();

    do {
        container = containersIteratorResult.value;
        const context = request.parentContext;
        const serviceIdentifier = request.serviceIdentifier;
        const activationsIterator = _getContainerActivationsForService(container, serviceIdentifier);

        if (isPromise(result)) {
            result = _activateContainerAsync<T>(activationsIterator, context, result);
        } else {
            result = _activateContainer<T>(activationsIterator, context, result);
        }

        containersIteratorResult = containersIterator.next();

        // make sure if we are currently on the container that owns the binding, not to keep looping down to child containers
    } while (containersIteratorResult.done !== true && !getBindingDictionary(container).hasKey(request.serviceIdentifier));

    return result;
}

const _bindingActivation = <T>(context: interfaces.Context, binding: interfaces.Binding<T>, previousResult: T): T | Promise<T> => {
    let result: T | Promise<T>;

    // use activation handler if available
    if (typeof binding.onActivation === "function") {
        result = binding.onActivation(context, previousResult);
    } else {
        result = previousResult;
    }

    return result;
}

const _activateContainer = <T> (
    activationsIterator: Iterator<interfaces.BindingActivation<any>>,
    context: interfaces.Context,
    result: T,
): T | Promise<T> => {
    let activation = activationsIterator.next();

    while (!activation.done) {
        result = activation.value(context, result);

        if (isPromise<T>(result)) {
            return _activateContainerAsync(activationsIterator, context, result);
        }

        activation = activationsIterator.next();
    }

    return result;
}

const _activateContainerAsync = async<T>(
    activationsIterator: Iterator<interfaces.BindingActivation<any>>,
    context: interfaces.Context,
    resultPromise: Promise<T>,
): Promise<T> => {
    let result = await resultPromise
    let activation = activationsIterator.next();

    while (!activation.done) {
      result = await activation.value(context, result);

      activation = activationsIterator.next();
    }

    return result;
}

const _getContainerActivationsForService = <T>(container: interfaces.Container, serviceIdentifier: interfaces.ServiceIdentifier<T>) => {
    // smell accessing _activations, but similar pattern is done in planner.getBindingDictionary()
    const activations = (container as any)._activations as interfaces.Lookup<interfaces.BindingActivation<any>>;

    return activations.hasKey(serviceIdentifier) ? activations.get(serviceIdentifier).values() : [].values();
}

const _getContainersIterator = (container: interfaces.Container): Iterator<interfaces.Container> => {
    const containersStack: interfaces.Container[] = [container];

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

function resolve<T>(context: interfaces.Context): T | Promise<T> | (T | Promise<T>)[] {
    const _f = _resolveRequest<T>(context.plan.rootRequest.requestScope);
    return _f(context.plan.rootRequest) as T | Promise<T> | (T | Promise<T>)[];
}

export { resolve };
