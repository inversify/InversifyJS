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
type FactoryTypeFunction = (context: interfaces.Context) => any;
const _getFactoryDetails = (
    binding:interfaces.Binding<unknown>,
    ): {
        factory: FactoryTypeFunction | null | undefined,
        factoryType: FactoryType
    } => {
    let factory: ((context: interfaces.Context) => any) | null | undefined;
    let factoryType:FactoryType = "toDynamicValue"
    switch(binding.type){
        case "DynamicValue":
            factory = binding.dynamicValue;
            factoryType = "toDynamicValue";
            break;
        case "Factory":
            factory = binding.factory;
            factoryType = "toFactory";
            break;
        case "Provider":
            factory = binding.provider;
            factoryType = "toProvider";
            break;
    }
    return {factory, factoryType};
}

const _newUnfinishedBindingError = (serviceIdentifier: interfaces.ServiceIdentifier<unknown>):Error => {
     // The user probably created a binding but didn't finish it
    // e.g. container.bind<T>("Something"); missing BindingToSyntax
    const serviceIdentifierAsString = getServiceIdentifierAsString(serviceIdentifier);
    return new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifierAsString}`);
}

const _getResolvedFromBinding = <T>(
    requestScope: interfaces.RequestScope,
    request: interfaces.Request,
    binding:interfaces.Binding<T>) => {
    let result: T | Promise<T>;
    const childRequests = request.childRequests;
    if (_isConstantType(binding.type) && binding.cache !== null) {
        result = binding.cache;
        binding.activated = true;
    } else if (binding.type === BindingTypeEnum.Constructor && binding.implementationType !== null) {
        result = binding.implementationType as T;
    } else if (binding.type === BindingTypeEnum.Instance && binding.implementationType !== null) {
        result = resolveInstance<T>(
            binding,
            binding.implementationType as interfaces.Newable<T>,
            childRequests,
            _resolveRequest<T>(requestScope)
        );
    } else {
        const factoryDetails = _getFactoryDetails(binding);
        if (factoryDetails.factory) {
            const factory = factoryDetails.factory;
            result = invokeFactory(factoryDetails.factoryType,binding.serviceIdentifier,() => {
                return factory(request.parentContext);
            });
        } else {
            throw _newUnfinishedBindingError(request.serviceIdentifier);
        }
    }

    return result;
}

const _tryGetFromScope = <T>(
    requestScope: interfaces.RequestScope,
    binding:interfaces.Binding<T>): T | Promise<T> | null => {

    if (_isSingletonScope(binding) && binding.activated) {
        return binding.cache!;
    }

    if (
        _isRequestScope(binding) &&
        requestScope !== null &&
        requestScope.has(binding.id)
    ) {
        return requestScope.get(binding.id);
    }
    return null;
}

const _isSingletonScope = (binding:interfaces.Binding<unknown>): boolean => {
    return binding.scope === BindingScopeEnum.Singleton;
}

const _isRequestScope = (binding:interfaces.Binding<unknown>): boolean => {
    return binding.scope === BindingScopeEnum.Request;
}

const _isConstantType = (type:interfaces.BindingType): boolean => {
    return type === BindingTypeEnum.ConstantValue || type === BindingTypeEnum.Function
}

const _saveToScope = <T>(
    requestScope: interfaces.RequestScope,
    binding:interfaces.Binding<T>,
    result:T | Promise<T>
): void => {
    // store in cache if scope is singleton
    if (_isSingletonScope(binding)) {
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
        _isRequestScope(binding) &&
        requestScope !== null &&
        !requestScope.has(binding.id)
    ) {
        requestScope.set(binding.id, result);
    }
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
