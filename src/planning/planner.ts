import interfaces from "../interfaces/interfaces";
import Plan from "./plan";
import Context from "./context";
import Request from "./request";
import Target from "./target";
import TargetType from "./target_type";
import * as ERROR_MSGS from "../constants/error_msgs";
import BindingType from "../bindings/binding_type";
import BindingCount from "../bindings/binding_count";
import getDependencies from "./reflection_utils";
import Metadata from "../planning/metadata";
import * as METADATA_KEY from "../constants/metadata_keys";
import {
    circularDependencyToException,
    getServiceIdentifierAsString,
    listRegisteredBindingsForServiceIdentifier,
    listMetadataForTarget
} from "../utils/serialization";

function _createTarget(
    isMultiInject: boolean,
    targetType: TargetType,
    serviceIdentifier: interfaces.ServiceIdentifier<any>,
    name: string,
    key?: string,
    value?: any
): interfaces.Target {

    let metadataKey = isMultiInject ? METADATA_KEY.MULTI_INJECT_TAG : METADATA_KEY.INJECT_TAG;
    let injectMetadata = new Metadata(metadataKey, serviceIdentifier);
    let target = new Target(targetType, name, serviceIdentifier, injectMetadata);

    if (key !== undefined) {
        let tagMetadata = new Metadata(key, value);
        target.metadata.push(tagMetadata);
    }

    return target;

}

function _getActiveBindings(
    context: interfaces.Context,
    parentRequest: interfaces.Request,
    target: interfaces.Target
): interfaces.Binding<any>[] {

    let bindings = getBindings<any>(context.kernel, target.serviceIdentifier);
    let activeBindings: interfaces.Binding<any>[] = [];

    // multiple bindings available but not a multi-injection
    if (bindings.length > 1) {

        // apply constraints if available to reduce the number of active bindings
        activeBindings = bindings.filter((binding) => {

            let request = new Request(
                binding.serviceIdentifier,
                context,
                parentRequest,
                binding,
                target
            );

            return binding.constraint(request);

        });

    } else {
        // simple injection or multi-injection without constraints
        activeBindings = bindings;
    }

    // validate active bindings
    _validateActiveBindingCount(target.serviceIdentifier, activeBindings, target, context.kernel);

    return activeBindings;
}

function _validateActiveBindingCount(
    serviceIdentifier: interfaces.ServiceIdentifier<any>,
    bindings: interfaces.Binding<any>[],
    target: interfaces.Target,
    kernel: interfaces.Kernel
): interfaces.Binding<any>[] {

    switch (bindings.length) {

        case BindingCount.NoBindingsAvailable:
            let serviceIdentifierString = getServiceIdentifierAsString(serviceIdentifier);
            let msg = ERROR_MSGS.NOT_REGISTERED;
            msg += listMetadataForTarget(serviceIdentifierString, target);
            msg += listRegisteredBindingsForServiceIdentifier(kernel, serviceIdentifierString, getBindings);
            throw new Error(msg);

        case BindingCount.OnlyOneBindingAvailable:
            if (target.isArray() === false) {
                return bindings;
            }

        case BindingCount.MultipleBindingsAvailable:
        default:
            if (target.isArray() === false) {
                let serviceIdentifierString = getServiceIdentifierAsString(serviceIdentifier),
                msg = `${ERROR_MSGS.AMBIGUOUS_MATCH} ${serviceIdentifierString}`;
                msg += listRegisteredBindingsForServiceIdentifier(kernel, serviceIdentifierString, getBindings);
                throw new Error(msg);
            } else {
                return bindings;
            }
    }

}

function _createSubRequests(
    serviceIdentifier: interfaces.ServiceIdentifier<any>,
    context: interfaces.Context,
    parentRequest: interfaces.Request,
    target: interfaces.Target
) {

    try {

        let activeBindings: interfaces.Binding<any>[];
        let childRequest: interfaces.Request;

        if (parentRequest === null) {

            activeBindings = _getActiveBindings(context, null, target);

            childRequest = new Request(
                serviceIdentifier,
                context,
                null,
                activeBindings,
                target
            );

            let plan = new Plan(context, childRequest);
            context.addPlan(plan);

        } else {
            activeBindings = _getActiveBindings(context, parentRequest, target);
            childRequest = parentRequest.addChildRequest(target.serviceIdentifier, activeBindings, target);
        }

        activeBindings.forEach((binding) => {

            let subChildRequest: interfaces.Request = null;

            if (target.isArray()) {
                subChildRequest = childRequest.addChildRequest(binding.serviceIdentifier, binding, target);
            } else {
                subChildRequest = childRequest;
            }

            if (binding.type === BindingType.Instance) {

                let dependencies = getDependencies(binding.implementationType);

                dependencies.forEach((dependency: interfaces.Target) => {
                    _createSubRequests(dependency.serviceIdentifier, context, subChildRequest, dependency);
                });

            }

        });

    } catch (error) {
        if (error instanceof RangeError) {
            circularDependencyToException(parentRequest.parentContext.plan.rootRequest);
        } else {
            throw new Error(error.message);
        }
    }
}

function getBindings<T>(
    kernel: interfaces.Kernel,
    serviceIdentifier: interfaces.ServiceIdentifier<T>
): interfaces.Binding<T>[] {

    let bindings: interfaces.Binding<T>[] = [];
    let bindingDictionary: interfaces.Lookup<interfaces.Binding<any>> = (<any>kernel)._bindingDictionary;

    if (bindingDictionary.hasKey(serviceIdentifier)) {

        bindings = bindingDictionary.get(serviceIdentifier);

    } else if (kernel.parent !== null) {

        // recursively try to get bindings from parent kernel
        bindings = getBindings<T>(kernel.parent, serviceIdentifier);

    }

    return bindings;
}

function plan(
    kernel: interfaces.Kernel,
    isMultiInject: boolean,
    targetType: TargetType,
    serviceIdentifier: interfaces.ServiceIdentifier<any>,
    key?: string,
    value?: any
): interfaces.Context {

    let context = new Context(kernel);
    let target = _createTarget(isMultiInject, targetType, serviceIdentifier, "", key, value);
    _createSubRequests(serviceIdentifier, context, null, target);
    return context;

}

export { plan, getBindings };
