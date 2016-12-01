import { interfaces } from "../interfaces/interfaces";
import { BindingScopeEnum, BindingTypeEnum } from "../constants/literal_types";
import { getServiceIdentifierAsString } from "../utils/serialization";
import { resolveInstance } from "./instantiation";
import * as ERROR_MSGS from "../constants/error_msgs";

function _resolveRequest(request: interfaces.Request): any {

    let bindings = request.bindings;
    let childRequests = request.childRequests;

    let targetIsAnAray = request.target && request.target.isArray();

    let targetParentIsNotAnArray = !request.parentRequest ||
                                   !request.parentRequest.target ||
                                   !request.target ||
                                   !request.parentRequest.target.matchesArray(request.target.serviceIdentifier);

    if (targetIsAnAray && targetParentIsNotAnArray) {

        // Create an array instead of creating an instance
        return childRequests.map((childRequest: interfaces.Request) => {
            return _resolveRequest(childRequest);
        });

    } else {

        let result: any = null;
        let binding = bindings[0];
        let isSingleton = binding.scope === BindingScopeEnum.Singleton;

        if (isSingleton && binding.activated === true) {
            return binding.cache;
        }

        switch (binding.type) {

            case BindingTypeEnum.ConstantValue:
                result = binding.cache;
                break;

            case BindingTypeEnum.DynamicValue:
                if (binding.dynamicValue === null) {
                    throw new Error(`${ERROR_MSGS.INVALID_BINDING_PROPERTY}DynamicValue`);
                }
                result = binding.dynamicValue(request.parentContext);
                break;

            case BindingTypeEnum.Constructor:
                result = binding.implementationType;
                break;

            case BindingTypeEnum.Factory:
                if (binding.factory === null) {
                    throw new Error(`${ERROR_MSGS.INVALID_BINDING_PROPERTY}factory`);
                }
                result = binding.factory(request.parentContext);
                break;

            case BindingTypeEnum.Function:
                result = binding.cache;
                break;

            case BindingTypeEnum.Provider:
                if (binding.provider === null) {
                    throw new Error(`${ERROR_MSGS.INVALID_BINDING_PROPERTY}provider`);
                }
                result = binding.provider(request.parentContext);
                break;

            case BindingTypeEnum.Instance:
                if (binding.implementationType === null) {
                    throw new Error(`${ERROR_MSGS.INVALID_BINDING_PROPERTY}implementationType`);
                }
                result = resolveInstance(binding.implementationType, childRequests, _resolveRequest);
                break;

            case BindingTypeEnum.Invalid:
            default:
                // The user probably created a binding but didn't finish it
                // e.g. container.bind<T>("Something"); missing BindingToSyntax
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

export { resolve };
