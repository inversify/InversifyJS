import * as ERROR_MSGS from "../constants/error_msgs";
import { BindingScopeEnum, BindingTypeEnum } from "../constants/literal_types";
import * as METADATA_KEY from "../constants/metadata_keys";
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
        if (request.target.isOptional() && bindings.length === 0) {
            return undefined;
        }

        const binding = bindings[0];

        const exists = findExistingInScope(binding, requestScope);

        if (exists) {
            return exists;
        }

        let result = convertBindingToInstance(requestScope, request);

        const old = result;

        if (result instanceof Lazy) {
            result = new Lazy(async () => {
              let resolved = await old.resolve();

              if (typeof binding.onActivation === "function") {
                resolved = binding.onActivation(request.parentContext, resolved);
              }

              return resolved;
            });
        } else {
            // use activation handler if available
            if (typeof binding.onActivation === "function") {
                result = binding.onActivation(request.parentContext, result);
            }

            if (result instanceof Promise) {
                result = new Lazy(() => old);
            }
        }

        afterResult(binding, result, requestScope);

        return result;
    }

};

function convertBindingToInstance(requestScope: interfaces.RequestScope, request: interfaces.Request) {
    const binding = request.bindings[0];

    if (binding.type === BindingTypeEnum.ConstantValue || binding.type === BindingTypeEnum.Function) {
        return binding.cache;
    }

    if (binding.type === BindingTypeEnum.Constructor) {
        return binding.implementationType;
    }

    if (binding.type === BindingTypeEnum.AsyncValue && binding.asyncValue !== null) {
        return binding.asyncValue;
    }

    if (binding.type === BindingTypeEnum.DynamicValue && binding.dynamicValue !== null) {
        return invokeFactory(
          "toDynamicValue",
          binding.serviceIdentifier,
          () => (binding.dynamicValue as (context: interfaces.Context) => any)(request.parentContext)
        );
    }

    if (binding.type === BindingTypeEnum.Factory && binding.factory !== null) {
        return invokeFactory(
          "toFactory",
          binding.serviceIdentifier,
          () => (binding.factory as interfaces.FactoryCreator<any>)(request.parentContext)
        );
    }

    if (binding.type === BindingTypeEnum.Provider && binding.provider !== null) {
        return invokeFactory(
          "toProvider",
          binding.serviceIdentifier,
          () => (binding.provider as interfaces.Provider<any>)(request.parentContext)
        );
    }

    if (binding.type === BindingTypeEnum.Instance && binding.implementationType !== null) {
        return resolveTypeInstance(requestScope, request);
    }

    // The user probably created a binding but didn't finish it
    // e.g. container.bind<T>("Something"); missing BindingToSyntax
    const serviceIdentifier = getServiceIdentifierAsString(request.serviceIdentifier);
    throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifier}`);
}

function resolveAndCheckInstance(
  binding: interfaces.Binding<any>,
  constr: interfaces.Newable<any>,
  childRequests: interfaces.Request[],
  resolveRequest: interfaces.ResolveRequestHandler
): any {
    if (binding.scope === "Transient") {
        if (typeof binding.onDeactivation === "function") {
            throw new Error(ERROR_MSGS.ON_DEACTIVATION_ERROR(constr.name, "Class cannot be instantiated in transient scope."));
        }

        if (Reflect.hasMetadata(METADATA_KEY.PRE_DESTROY, constr)) {
            throw new Error(ERROR_MSGS.PRE_DESTROY_ERROR(constr.name, "Class cannot be instantiated in transient scope."));
        }
    }

    return resolveInstance(constr, childRequests, resolveRequest);
}

function resolveTypeInstance<T>(requestScope: interfaces.RequestScope, request: interfaces.Request): any {
    const binding = request.bindings[0];
    const childRequests = request.childRequests;

    const resolver = _resolveRequest(requestScope);

    if (!request.isLazy() && !request.hasLazyChildren()) {
        return resolveAndCheckInstance(
          binding,
          binding.implementationType as Newable<any>,
          childRequests,
          resolver
        );
    }

    const lazies: Record<number, any> = {};

    const lazyResolver = (lazyRequest: interfaces.Request) => {
        if (lazies[lazyRequest.id]) {
            return lazies[lazyRequest.id];
        }

        return resolver(lazyRequest);
    };

    return new Lazy(() => resolveLazy(lazyResolver, requestScope, request, lazies));
}

async function resolveLazy(
  resolver: (request: interfaces.Request) => any,
  requestScope: interfaces.RequestScope,
  request: interfaces.Request,
  lazies: Record<number, any>
) {
    const binding = request.bindings[0];

    if (request.hasLazyChildren()) {
        for (const child of request.childRequests) {
            const childBinding = child.bindings[0];

            let childValue = findExistingInScope(childBinding, requestScope);

            if (!childValue) {
                childValue = await resolveLazy(resolver, requestScope, child, lazies);

                afterResult(childBinding, childValue, requestScope);
            }

            if (childValue instanceof Lazy) {
               childValue = await childValue.resolve();
            }

            lazies[child.id] = childValue;
        }
    }

    let value;

    if (request.isLazy()) {
        lazies[request.id] = await binding.asyncValue.resolve();

        value = lazies[request.id];
    } else if (binding.type === BindingTypeEnum.Instance && binding.implementationType !== null) {
        value = resolveAndCheckInstance(
          binding,
          binding.implementationType,
          request.childRequests,
          resolver
        );

        afterResult(binding, value, requestScope);
    } else {
        value = convertBindingToInstance(requestScope, request);
    }

    if (value instanceof Lazy) {
        value = await value.resolve();
    }

    return value;
}

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
