import { POST_CONSTRUCT_ERROR } from "../constants/error_msgs";
import { TargetTypeEnum } from "../constants/literal_types";
import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";
import { Lazy } from "./lazy";

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

function _postConstruct(constr: interfaces.Newable<any>, result: any): Promise<void> | undefined {
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
    constr: interfaces.Newable<any>,
    childRequests: interfaces.Request[],
    resolveRequest: interfaces.ResolveRequestHandler
): any {

    let result: any = null;

    if (childRequests.length > 0) {

        const constructorInjectionsRequests = childRequests.filter((childRequest: interfaces.Request) =>
            (childRequest.target !== null && childRequest.target.type === TargetTypeEnum.ConstructorArgument));

        const constructorInjections = constructorInjectionsRequests.map(resolveRequest);

        result = _createInstance(constr, constructorInjections);
        result = _injectProperties(result, childRequests, resolveRequest);

    } else {
        result = new constr();
    }

    const post = _postConstruct(constr, result);

    if (post instanceof Promise) {
        return new Lazy(async () => {
            await post;

            return result;
        });
    }

    return result;
}

export { resolveInstance };
