import { ON_DEACTIVATION_ERROR, POST_CONSTRUCT_ERROR, PRE_DESTROY_ERROR } from "../constants/error_msgs";
import { TargetTypeEnum } from "../constants/literal_types";
import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";
import { isPromise, isPromiseOrContainsPromise } from "../utils/async";

function _createInstance<T>(
    constr: interfaces.Newable<T>,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler,
): T | Promise<T> {
    let result: T | Promise<T>;

    if (childRequests.length > 0) {
        let isAsync = false
        const constructorInjections: unknown[] = []
        const propertyRequests: interfaces.Request[] = []
        const propertyInjections: unknown[] = []
        for(const childRequest of childRequests){
            let injection:unknown
            const target = childRequest.target
            const targetType = target.type
            if(targetType === TargetTypeEnum.ConstructorArgument){
                injection = resolveRequest(childRequest)
                constructorInjections.push(injection)
            }else{
                propertyRequests.push(childRequest)
                injection = resolveRequest(childRequest)
                propertyInjections.push(injection)
            }
            if(!isAsync){
                isAsync = isPromiseOrContainsPromise(injection);
            }
        }
        if(isAsync){
            result = createInstanceWithInjectionsAsync(constructorInjections,propertyRequests,propertyInjections, constr)
        }else{
            result = createInstanceWithInjections(constructorInjections,propertyRequests,propertyInjections, constr)
        }
    } else {
        result = new constr();
    }

    return result;
}

function createInstanceWithInjections<T>(
    constructorArgs:unknown[],
    propertyRequests:interfaces.Request[],
    propertyValues:unknown[],
    constr:interfaces.Newable<T>): T{
        const instance = new constr(...constructorArgs);
        propertyRequests.forEach((r: interfaces.Request, index: number) => {
            const propertyName = r.target.name.value();
            const injection = propertyValues[index];
            (instance as Record<string, unknown>)[propertyName] = injection;
        });
        return instance

}
async function createInstanceWithInjectionsAsync<T>(
    possiblePromiseConstructorArgs:unknown[],
    propertyRequests:interfaces.Request[],
    possiblyPromisePropertyValues:unknown[],
    constr:interfaces.Newable<T>):Promise<T>{
        const ctorArgs = await possiblyWaitInjections(possiblePromiseConstructorArgs)
        const propertyValues = await possiblyWaitInjections(possiblyPromisePropertyValues)
        return createInstanceWithInjections<T>(ctorArgs,propertyRequests,propertyValues, constr)
}
async function possiblyWaitInjections(possiblePromiseinjections:unknown[]){
    const injections:unknown[] = [];
    for(const injection of possiblePromiseinjections){
        if(Array.isArray(injection)){
            injections.push(Promise.all(injection))
        }else{
            injections.push(injection)
        }
    }
    return Promise.all(injections)
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
