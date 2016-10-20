import interfaces from "../interfaces/interfaces";
import BindingScope from "../bindings/binding_scope";
import BindingType from "../bindings/binding_type";
import * as ERROR_MSGS from "../constants/error_msgs";
import { getServiceIdentifierAsString } from "../utils/serialization";
import resolveInstance from "./instantiation";

function _resolveRequest(request: interfaces.Request): any {

    let bindings = request.bindings;
    let childRequests = request.childRequests;

    let targetIsAnAray = request.target && request.target.isArray();

    let targetParentIsNotAnArray = !request.parentRequest ||
                                   !request.parentRequest.target ||
                                   !request.parentRequest.target.matchesArray(request.target.serviceIdentifier);

    if (targetIsAnAray && targetParentIsNotAnArray) {

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
                result = resolveInstance(binding.implementationType, childRequests, _resolveRequest);
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
