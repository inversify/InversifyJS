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
    listRegisteredBindingsForServiceIdentifier
} from "../utils/serialization";

class Planner implements interfaces.Planner {

    public plan(
        kernel: interfaces.Kernel,
        target: interfaces.Target
    ): interfaces.Context {

        let context = new Context(kernel);
        let bindings: any = null;
        let plan = this.createPlan(context, bindings, target);

        plan.rootRequest = null;

        return context;
    }

    public createContext(kernel: interfaces.Kernel): interfaces.Context {
        return new Context(kernel);
    }

    public createTarget(
        isMultiInject: boolean,
        targetType: TargetType,
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        key?: string,
        value?: any,
        name = ""
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

    public createRootRequest(
        kernel: interfaces.Kernel,
        context: interfaces.Context,
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        target: interfaces.Target
    ): interfaces.Request {

        // let bindings = this.getBindings<any>(kernel, serviceIdentifier);

        let request = new Request(
            serviceIdentifier,
            context,
            null,
            null, // bindings,
            target
        );

        // bindings = this.getActiveBindings(kernel, request, target);
        // bindings = this.validateActiveBindingCount(serviceIdentifier, bindings, target, kernel);

        return request;
    }

    public createPlan(
        context: interfaces.Context,
        binding: interfaces.Binding<any>,
        target: interfaces.Target
    ): interfaces.Plan {

        let rootRequest = new Request(
            binding.serviceIdentifier,
            context,
            null,
            binding,
            target);

        let plan = new Plan(context, rootRequest);

        // Plan and Context are duable linked
        context.addPlan(plan);

        if (binding.type === BindingType.Instance) {
            let dependencies = getDependencies(binding.implementationType);
            dependencies.forEach((dependency) => { this._createSubRequest(context.kernel, rootRequest, dependency); });
        }

        return plan;
    }

    public getBindings<T>(
        kernel: interfaces.Kernel,
        serviceIdentifier: interfaces.ServiceIdentifier<T>
    ): interfaces.Binding<T>[] {

        let bindings: interfaces.Binding<T>[] = [];
        let _kernel: any = kernel;

        let _bindingDictionary = _kernel._bindingDictionary;

        if (_bindingDictionary.hasKey(serviceIdentifier)) {
            bindings = _bindingDictionary.get(serviceIdentifier);
        } else if (_kernel._parentKernel !== undefined) {
            // recursively try to get bindings from parent kernel
            bindings = this.getBindings<T>(_kernel._parentKernel, serviceIdentifier);
        }

        return bindings;
    }

    public getActiveBindings(
        kernel: interfaces.Kernel,
        parentRequest: interfaces.Request,
        target: interfaces.Target
    ): interfaces.Binding<any>[] {

        let bindings = this.getBindings<any>(kernel, target.serviceIdentifier);
        let activeBindings: interfaces.Binding<any>[] = [];

        let multipleBindingsAvaiableButNotMultiInjection = (bindings.length > 1 && target.isArray() === false);

        if (multipleBindingsAvaiableButNotMultiInjection) {

            // apply constraints if available to reduce the number of active bindings
            activeBindings = bindings.filter((binding) => {

                let request = new Request(
                    binding.serviceIdentifier,
                    parentRequest.parentContext,
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

        return activeBindings;
    }

    public validateActiveBindingCount(
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        bindings: interfaces.Binding<any>[],
        target: interfaces.Target,
        kernel: interfaces.Kernel
    ): interfaces.Binding<any>[] {

        switch (bindings.length) {

            case BindingCount.NoBindingsAvailable:

                let serviceIdentifierString = getServiceIdentifierAsString(serviceIdentifier),
                    msg = ERROR_MSGS.NOT_REGISTERED;

                if (target.isTagged() || target.isNamed()) {
                    let m = target.metadata[0].toString();
                    msg = `${msg} ${serviceIdentifierString}\n ${serviceIdentifierString} - ${m}`;
                } else {
                    msg = `${msg} ${serviceIdentifierString}`;
                }

                msg += listRegisteredBindingsForServiceIdentifier(kernel, serviceIdentifierString);

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
                    msg += listRegisteredBindingsForServiceIdentifier(kernel, serviceIdentifierString);
                    throw new Error(msg);
                } else {
                    return bindings;
                }
        }

    }

    private _createSubRequest(kernel: interfaces.Kernel, parentRequest: interfaces.Request, target: interfaces.Target) {

        try {
            let activeBindings = this.getActiveBindings(kernel, parentRequest, target);

            activeBindings = this.validateActiveBindingCount(
                target.serviceIdentifier,
                activeBindings,
                target,
                parentRequest.parentContext.kernel
            );

            this._createChildRequest(kernel, parentRequest, target, activeBindings);

        } catch (error) {
            if (error instanceof RangeError) {
                circularDependencyToException(parentRequest.parentContext.plan.rootRequest);
            } else {
                throw new Error(error.message);
            }
        }
    }

    private _createChildRequest(
        kernel: interfaces.Kernel,
        parentRequest: interfaces.Request,
        target: interfaces.Target,
        bindings: interfaces.Binding<any>[]
    ) {

        // Use the only active binding to create a child request
        let childRequest = parentRequest.addChildRequest(target.serviceIdentifier, bindings, target);
        let subChildRequest = childRequest;

        bindings.forEach((binding) => {

            if (target.isArray()) {
                subChildRequest = childRequest.addChildRequest(binding.serviceIdentifier, binding, target);
            }

            // Only try to plan sub-dependencies when binding type is BindingType.Instance
            if (binding.type === BindingType.Instance) {

                // Create child requests for sub-dependencies if any
                let subDependencies = getDependencies(binding.implementationType);
                subDependencies.forEach((d, index) => {
                    this._createSubRequest(kernel, subChildRequest, d);
                });
            }

        });
    }


}

export default Planner;
