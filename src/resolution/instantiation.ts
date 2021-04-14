import { ON_DEACTIVATION_ERROR, POST_CONSTRUCT_ERROR, PRE_DESTROY_ERROR } from "../constants/error_msgs";
import { TargetTypeEnum } from "../constants/literal_types";
import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";
import { isPromise } from "../utils/async";

function _injectProperties<T>(
    instance: T,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler
): T {
    const propertyInjectionsRequests = _filterRequestsByTargetType(childRequests, TargetTypeEnum.ClassProperty);

    const propertyInjections = propertyInjectionsRequests.map(resolveRequest);

    propertyInjectionsRequests.forEach((r: interfaces.Request, index: number) => {
        const propertyName = r.target.name.value();
        const injection = propertyInjections[index];

        (instance as Record<string, unknown>)[propertyName] = injection;
    });

    return instance;

}

function _createInstance<T>(
    constr: interfaces.Newable<T>,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler,
): T | Promise<T> {
    let result: T | Promise<T>;

    if (childRequests.length > 0) {
        const constructorInjections = _getConstructionInjections(childRequests, resolveRequest);

        if (constructorInjections.some(isPromise)) {
            result = _createInstanceWithConstructorInjectionsAsync(
                constructorInjections,
                constr,
                childRequests,
                resolveRequest
            );
        } else {
            result = _createInstanceWithConstructorInjections(constructorInjections, constr,childRequests, resolveRequest);
        }
    } else {
        result = new constr();
    }

    return result;
}

function _createInstanceWithConstructorInjections<T>(
    constructorInjections: unknown[],
    constr: interfaces.Newable<T>,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler,
): T {
    let result: T;

    result = new constr(...constructorInjections);
    result = _injectProperties(result, childRequests, resolveRequest);

    return result;
}

async function _createInstanceWithConstructorInjectionsAsync<T>(
    constructorInjections: (unknown | Promise<unknown>)[],
    constr: interfaces.Newable<T>,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler,
): Promise<T> {
    return _createInstanceWithConstructorInjections(
        await Promise.all(constructorInjections),
        constr,
        childRequests,
        resolveRequest,
    );
}

function _filterRequestsByTargetType(requests: interfaces.Request[], type: interfaces.TargetType): interfaces.Request[] {
    return requests.filter((request: interfaces.Request) =>
        (request.target !== null && request.target.type === type));
}

function _getConstructionInjections(childRequests: interfaces.Request[], resolveRequest: interfaces.ResolveRequestHandler): unknown[] {
    const constructorInjectionsRequests = _filterRequestsByTargetType(childRequests, TargetTypeEnum.ConstructorArgument);

    return constructorInjectionsRequests.map(resolveRequest);
}

function _getInstanceAfterPostConstruct<T>(constr: interfaces.Newable<T>, result: T): T | Promise<T> {

    const postConstructResult = _postConstruct(constr, result);

    if (isPromise(postConstructResult)) {
        return postConstructResult.then(() => result);
    } else {
        return result;
    }
}

function _postConstruct<T>(constr: interfaces.Newable<T>, instance: T): void | Promise<void> {
    if (Reflect.hasMetadata(METADATA_KEY.POST_CONSTRUCT, constr)) {
        const data: Metadata = Reflect.getMetadata(METADATA_KEY.POST_CONSTRUCT, constr);
        try {
            return (instance as T & Record<string, () => void>)[data.value]();
        } catch (e) {
            throw new Error(POST_CONSTRUCT_ERROR(constr.name, e.message));
        }
    }
}

function _validateInstanceResolution(binding: interfaces.Binding<unknown>, constr: interfaces.Newable<unknown>): void {
    if (binding.scope === "Transient") {
        if (typeof binding.onDeactivation === "function") {
            throw new Error(ON_DEACTIVATION_ERROR(constr.name, "Class cannot be instantiated in transient scope."));
        }

        if (Reflect.hasMetadata(METADATA_KEY.PRE_DESTROY, constr)) {
            throw new Error(PRE_DESTROY_ERROR(constr.name, "Class cannot be instantiated in transient scope."));
        }
    }
}

function resolveInstance<T>(
    binding: interfaces.Binding<T>,
    constr: interfaces.Newable<T>,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler,
): T | Promise<T> {
    _validateInstanceResolution(binding, constr);

    const result = _createInstance(constr, childRequests, resolveRequest);

    if (isPromise(result)) {
        return result.then((resolvedResult) => _getInstanceAfterPostConstruct(constr, resolvedResult));
    } else {
        return _getInstanceAfterPostConstruct(constr, result);
    }
}

export { resolveInstance };
