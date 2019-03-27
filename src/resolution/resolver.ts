import * as ERROR_MSGS from "../constants/error_msgs";
import { BindingScopeEnum, BindingTypeEnum } from "../constants/literal_types";
import { interfaces } from "../interfaces/interfaces";
import { isStackOverflowExeption } from "../utils/exceptions";
import { getServiceIdentifierAsString } from "../utils/serialization";
import { resolveInstance } from "./instantiation";
import { Lazy } from "./lazy";
import Newable = interfaces.Newable;

type FactoryType = "toAsyncValue" | "toDynamicValue" | "toFactory" | "toAutoFactory" | "toProvider";

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

        const exists = findExistingInScope(binding, requestScope);

        if (exists) {
            return exists;
        }

        if (binding.type === BindingTypeEnum.ConstantValue) {
            result = binding.cache;
        } else if (binding.type === BindingTypeEnum.Function) {
            result = binding.cache;
        } else if (binding.type === BindingTypeEnum.Constructor) {
            result = binding.implementationType;
        } else if (binding.type === BindingTypeEnum.AsyncValue && binding.asyncValue !== null) {
            result = binding.asyncValue;
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
            const lazyChildren = childRequests.filter((child) => child.bindings.some((b) => b.type === BindingTypeEnum.AsyncValue));

            const resolver =  _resolveRequest(requestScope);

            if (lazyChildren.length > 0) {
                result = new Lazy(async () => {
                    const lazies: Record<number, any> = {};

                    await Promise.all(lazyChildren.map(async (child) => {
                        const childBinding = child.bindings[0];

                        const childExists = findExistingInScope(childBinding, requestScope);

                        if (childExists) {
                            lazies[child.id] = childExists;
                        } else {
                            const value = await childBinding.asyncValue.resolve();

                            afterResult(childBinding, value, requestScope);

                            lazies[child.id] = value;
                        }
                    }));

                    const lazyResolve = (lazyRequest: interfaces.Request) => {
                        if (lazies[lazyRequest.id]) {
                            return lazies[lazyRequest.id];
                        }

                        return resolver(lazyRequest);
                    };

                    return resolveInstance(
                      binding.implementationType as Newable<any>,
                      childRequests,
                      lazyResolve,
                    );
                  });

            } else {
                result = resolveInstance(
                  binding.implementationType,
                  childRequests,
                  resolver,
                );
            }
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

        afterResult(binding, result, requestScope);

        return result;
    }

};

function findExistingInScope<T>(binding: interfaces.Binding<T>, requestScope: interfaces.RequestScope) {
    if (binding.scope === BindingScopeEnum.Singleton && binding.activated) {
        return binding.cache;
    }

    if (
      binding.scope === BindingScopeEnum.Request &&
      requestScope !== null &&
      requestScope.has(binding.id)
    ) {
        return requestScope.get(binding.id);
    }

    return null;
}

function afterResult<T>(binding: interfaces.Binding<T>, result: T, requestScope: interfaces.RequestScope) {
    // store in cache if scope is singleton
    if (binding.scope === BindingScopeEnum.Singleton) {
        binding.cache = result;
        binding.activated = true;
    }

    if (
      binding.scope === BindingScopeEnum.Request &&
      requestScope !== null &&
      !requestScope.has(binding.id)
    ) {
        requestScope.set(binding.id, result);
    }
}

function resolve<T>(context: interfaces.Context): T {
    const _f = _resolveRequest(context.plan.rootRequest.requestScope);
    return _f(context.plan.rootRequest);
}

export { resolve };
