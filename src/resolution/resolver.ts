import * as ERROR_MSGS from "../constants/error_msgs";
import { BindingScopeEnum, BindingTypeEnum } from "../constants/literal_types";
import { interfaces } from "../interfaces/interfaces";
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

const _resolveRequest = (requestScope: interfaces.RequestScope) =>
    (request: interfaces.Request): any => {

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
            return _f(childRequest);
        });

    } else {

        let result: any = null;

        if (request.target.isOptional() && bindings.length === 0) {
            return undefined;
        }

        const binding = bindings[0];
        const isSingleton = binding.scope === BindingScopeEnum.Singleton;
        const isRequestSingleton = binding.scope === BindingScopeEnum.Request;

        if (isSingleton && binding.activated) {
            return binding.cache;
        }

        if (
            isRequestSingleton &&
            requestScope !== null &&
            requestScope.has(binding.guid)
        ) {
            return requestScope.get(binding.guid);
        }

        if (binding.type === BindingTypeEnum.ConstantValue) {
            result = binding.cache;
        } else if (binding.type === BindingTypeEnum.Function) {
            result = binding.cache;
        } else if (binding.type === BindingTypeEnum.Constructor) {
            result = binding.implementationType;
        } else if (binding.type === BindingTypeEnum.DynamicValue && binding.dynamicValue !== null) {
            result = invokeFactory(
                "toDynamicValue",
                binding.serviceIdentifier,
                () => (binding.dynamicValue as (context: interfaces.Context) => any)(request.parentContext)
            );
        } else if (binding.type === BindingTypeEnum.Factory && binding.factory !== null) {
            result = invokeFactory(
                "toFactory",
                binding.serviceIdentifier,
                () => (binding.factory as interfaces.FactoryCreator<any>)(request.parentContext)
            );
        } else if (binding.type === BindingTypeEnum.Provider && binding.provider !== null) {
            result = invokeFactory(
                "toProvider",
                binding.serviceIdentifier,
                () => (binding.provider as interfaces.Provider<any>)(request.parentContext)
            );
        } else if (binding.type === BindingTypeEnum.Instance && binding.implementationType !== null) {
            result = resolveInstance(
                binding.implementationType,
                childRequests,
                _resolveRequest(requestScope)
            );
        } else {
            // The user probably created a binding but didn't finish it
            // e.g. container.bind<T>("Something"); missing BindingToSyntax
            const serviceIdentifier = getServiceIdentifierAsString(request.serviceIdentifier);
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

        if (
            isRequestSingleton &&
            requestScope !== null &&
            !requestScope.has(binding.guid)
        ) {
            requestScope.set(binding.guid, result);
        }

        return result;
    }

};

function resolve<T>(context: interfaces.Context): T {
    const _f = _resolveRequest(context.plan.rootRequest.requestScope);
    return _f(context.plan.rootRequest);
}

export { resolve };
