import { ON_DEACTIVATION_ERROR, POST_CONSTRUCT_ERROR, PRE_DESTROY_ERROR } from "../constants/error_msgs";
import { TargetTypeEnum } from "../constants/literal_types";
import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";

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

function _createInstance(Func: interfaces.Newable<any>, injections: Object[]): any {
    return new Func(...injections);
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

function resolveInstance(
    binding: interfaces.Binding<any>,
    constr: interfaces.Newable<any>,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler
): any {
    if (binding.scope === "Transient") {
        if (typeof binding.onDeactivation === "function") {
            throw new Error(ON_DEACTIVATION_ERROR(constr.name, "Class cannot be instantiated in transient scope."));
        }

        if (Reflect.hasMetadata(METADATA_KEY.PRE_DESTROY, constr)) {
            throw new Error(PRE_DESTROY_ERROR(constr.name, "Class cannot be instantiated in transient scope."));
        }
    }

    let result: any = null;

    if (childRequests.length > 0) {
        const constructorInjectionsRequests = childRequests.filter((childRequest: interfaces.Request) =>
            (childRequest.target !== null && childRequest.target.type === TargetTypeEnum.ConstructorArgument));

        const constructorInjections = constructorInjectionsRequests.map(resolveRequest);

        if (constructorInjections.some((ci) => ci instanceof Promise)) {
            return new Promise( async (resolve, reject) => {
                try {
                    const resolved = await Promise.all(constructorInjections);

                    result = _createInstance(constr, resolved);
                    result = _injectProperties(result, childRequests, resolveRequest);

                    await _postConstruct(constr, result);

                    resolve(result);
                } catch (ex) {
                    reject(ex);
                }
            });
        }

        result = _createInstance(constr, constructorInjections);
        result = _injectProperties(result, childRequests, resolveRequest);

    } else {
        result = new constr();
    }

    const post = _postConstruct(constr, result);

    if (post instanceof Promise) {
        return post.then(() => result);
    }

    return result;
}

export { resolveInstance };
