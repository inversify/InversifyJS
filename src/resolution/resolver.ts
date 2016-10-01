import interfaces from "../interfaces/interfaces";
import BindingScope from "../bindings/binding_scope";
import BindingType from "../bindings/binding_type";
import TargetType from "../planning/target_type";
import * as ERROR_MSGS from "../constants/error_msgs";
import { getServiceIdentifierAsString } from "../utils/serialization";

function _injectProperties(instance: any, childRequests: interfaces.Request[]): any {

    let propertyInjectionsRequests = childRequests.filter((childRequest: interfaces.Request) => {
        return childRequest.target.type === TargetType.ClassProperty;
    });

    let propertyInjections = propertyInjectionsRequests.map((childRequest: interfaces.Request) => {
        return _resolveRequest(childRequest);
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


function _resolveInstance(
    constr: interfaces.Newable<any>,
    childRequests: interfaces.Request[]
): any {

    let result: any = null;

    if (childRequests.length > 0) {

        let constructorInjectionsRequests = childRequests.filter((childRequest: interfaces.Request) => {
            return childRequest.target.type === TargetType.ConstructorArgument;
        });

        let constructorInjections = constructorInjectionsRequests.map((childRequest: interfaces.Request) => {
            return _resolveRequest(childRequest);
        });

        result = _createInstance(constr, constructorInjections);
        result = _injectProperties(result, childRequests);

    } else {
        result = new constr();
    }

    return result;
}

function _resolveRequest(request: interfaces.Request): any {

    let bindings = request.bindings;
    let childRequests = request.childRequests;

    if (
        request.target && request.target.isArray() &&
        (!request.parentRequest.target || !request.parentRequest.target.matchesArray(request.target.serviceIdentifier))
    ) {

        // Create an array instead of creating an instance
        return childRequests.map((childRequest: interfaces.Request) => {
            return _resolveRequest(childRequest);
        });

    } else {

        let result: any = null;
        let binding = bindings[0];
        let isSingleton = binding.scope === BindingScope.Singleton;

        if (isSingleton && binding.activated === true) {
            return binding.cache;
        }

        switch (binding.type) {

            case BindingType.ConstantValue:
                result = binding.cache;
                break;

            case BindingType.DynamicValue:
                result = binding.dynamicValue(request.parentContext);
                break;

            case BindingType.Constructor:
                result = binding.implementationType;
                break;

            case BindingType.Factory:
                result = binding.factory(request.parentContext);
                break;

                case BindingType.Function:
                result = binding.cache;
                break;

            case BindingType.Provider:
                result = binding.provider(request.parentContext);
                break;

            case BindingType.Instance:
                result = _resolveInstance(binding.implementationType, childRequests);
                break;

            case BindingType.Invalid:
            default:
                // The user probably created a binding but didn't finish it
                // e.g. kernel.bind<T>("Something"); missing BindingToSyntax
                let serviceIdentifier = getServiceIdentifierAsString(request.serviceIdentifier);
                throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifier}`);
        }

        // use activation handler if available
        if (typeof binding.onActivation === "function") {
            result = binding.onActivation(request.parentContext, result);
        }

        // store in cache if scope is singleton
        if (isSingleton) {
            binding.cache = result;
            binding.activated = true;
        }

        return result;
    }

}

function resolve<T>(context: interfaces.Context): T {
    return _resolveRequest(context.plan.rootRequest);
}

export default resolve;
