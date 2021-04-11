import { ON_DEACTIVATION_ERROR, POST_CONSTRUCT_ERROR, PRE_DESTROY_ERROR } from "../constants/error_msgs";
import { TargetTypeEnum } from "../constants/literal_types";
import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";
import { isPromise } from "../utils/async";

function _injectProperties(
    instance: any,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler
): any {
    const propertyInjectionsRequests = childRequests.filter((childRequest: interfaces.Request) =>
        (
            childRequest.target !== null &&
            childRequest.target.type === TargetTypeEnum.ClassProperty
        ));

    const propertyInjections = propertyInjectionsRequests.map(resolveRequest);

    propertyInjectionsRequests.forEach((r: interfaces.Request, index: number) => {
        let propertyName = "";
        propertyName = r.target.name.value();
        const injection = propertyInjections[index];
        instance[propertyName] = injection;
    });

    return instance;

}

function _createInstance(
    constr: interfaces.Newable<any>,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler,
): any {
    let result: any;

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

function _createInstanceWithConstructorInjections(
    constructorInjections: any[],
    constr: interfaces.Newable<any>,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler,
): any {
    let result: any;

    result = new constr(...constructorInjections);
    result = _injectProperties(result, childRequests, resolveRequest);

    return result;
}

async function _createInstanceWithConstructorInjectionsAsync(
    constructorInjections: any[],
    constr: interfaces.Newable<any>,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler,
): Promise<any> {
    return _createInstanceWithConstructorInjections(
        await Promise.all(constructorInjections),
        constr,
        childRequests,
        resolveRequest,
    );
}

function _getConstructionInjections(childRequests: interfaces.Request[], resolveRequest: interfaces.ResolveRequestHandler): any[] {
    const constructorInjectionsRequests = childRequests.filter((childRequest: interfaces.Request) =>
        (childRequest.target !== null && childRequest.target.type === TargetTypeEnum.ConstructorArgument));

    return constructorInjectionsRequests.map(resolveRequest);
}

function _getInstanceAfterPostConstruct(constr: interfaces.Newable<any>, result: any): any {

    const postConstructResult = _postConstruct(constr, result);

    if (isPromise(postConstructResult)) {
        return postConstructResult.then(() => result);
    } else {
        return result;
    }
}

function _postConstruct(constr: interfaces.Newable<any>, result: any): void | Promise<void> {
    if (Reflect.hasMetadata(METADATA_KEY.POST_CONSTRUCT, constr)) {
        const data: Metadata = Reflect.getMetadata(METADATA_KEY.POST_CONSTRUCT, constr);
        try {
            return result[data.value]();
        } catch (e) {
            throw new Error(POST_CONSTRUCT_ERROR(constr.name, e.message));
        }
    }
}

function _validateInstanceResolution(binding: interfaces.Binding<any>, constr: interfaces.Newable<any>): void {
    if (binding.scope === "Transient") {
        if (typeof binding.onDeactivation === "function") {
            throw new Error(ON_DEACTIVATION_ERROR(constr.name, "Class cannot be instantiated in transient scope."));
        }

        if (Reflect.hasMetadata(METADATA_KEY.PRE_DESTROY, constr)) {
            throw new Error(PRE_DESTROY_ERROR(constr.name, "Class cannot be instantiated in transient scope."));
        }
    }
}

function resolveInstance(
    binding: interfaces.Binding<any>,
    constr: interfaces.Newable<any>,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler,
): any {
    _validateInstanceResolution(binding, constr);

    const result = _createInstance(constr, childRequests, resolveRequest);

    if (isPromise(result)) {
        return result.then((resolvedResult) => _getInstanceAfterPostConstruct(constr, resolvedResult));
    } else {
        return _getInstanceAfterPostConstruct(constr, result);
    }
}

export { resolveInstance };
