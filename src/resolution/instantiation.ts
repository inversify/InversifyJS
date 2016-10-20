import TargetType from "../planning/target_type";
import interfaces from "../interfaces/interfaces";

function _injectProperties(
    instance: any,
    childRequests: interfaces.Request[],
    resolveRequest: (request: interfaces.Request) => any
): any {

    let propertyInjectionsRequests = childRequests.filter((childRequest: interfaces.Request) => {
        return childRequest.target.type === TargetType.ClassProperty;
    });

    let propertyInjections = propertyInjectionsRequests.map((childRequest: interfaces.Request) => {
        return resolveRequest(childRequest);
    });

    propertyInjectionsRequests.forEach((r: interfaces.Request, index: number) => {
        let injection = propertyInjections[index];
        instance[r.target.name.value()] = injection;
    });

    return instance;

}

function _createInstance(Func: interfaces.Newable<any>, injections: Object[]): any {
    return new Func(...injections);
}

function resolveInstance(
    constr: interfaces.Newable<any>,
    childRequests: interfaces.Request[],
    resolveRequest: (request: interfaces.Request) => any
): any {

    let result: any = null;

    if (childRequests.length > 0) {

        let constructorInjectionsRequests = childRequests.filter((childRequest: interfaces.Request) => {
            return childRequest.target.type === TargetType.ConstructorArgument;
        });

        let constructorInjections = constructorInjectionsRequests.map((childRequest: interfaces.Request) => {
            return resolveRequest(childRequest);
        });

        result = _createInstance(constr, constructorInjections);
        result = _injectProperties(result, childRequests, resolveRequest);

    } else {
        result = new constr();
    }

    return result;
}

export default resolveInstance;
