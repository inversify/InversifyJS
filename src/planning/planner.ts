///<reference path="../interfaces/interfaces.d.ts" />

import Plan from "./plan";
import Context from "./context";
import Request from "./request";
import Target from "./target";
import * as METADATA_KEY from "../constants/metadata_keys";
import * as ERROR_MSGS from "../constants/error_msgs";
import BindingType from "../bindings/binding_type";

class Planner implements IPlanner {

    public createContext(kernel: IKernel): IContext {
        return new Context(kernel);
    }

    public createPlan(context: IContext, binding: IBinding<any>): IPlan {

        let rootRequest = new Request(
            binding.runtimeIdentifier,
            context,
            null,
            binding);

        rootRequest.bindings.push(binding);
        let plan = new Plan(context, rootRequest);

        // Plan and Context are duable linked
        context.addPlan(plan);

        let dependencies = this._getDependencies(binding.implementationType);

        dependencies.forEach((d) => { this._createSubRequest(rootRequest, d); });
        return plan;
    }

    public getBindings<T>(kernel: IKernel, service: string): IBinding<T>[] {
        let bindings: IBinding<T>[] = [];
        let _kernel: any = kernel;
        let _bindingDictionary = _kernel._bindingDictionary;
        let _service = service.split("[]").join("");
        if (_bindingDictionary.hasKey(_service)) {
            bindings = _bindingDictionary.get(_service);
        }
        return bindings;
    }

    private _createSubRequest(parentRequest: IRequest, target: ITarget) {

        try {

            let bindings = this.getBindings<any>(parentRequest.parentContext.kernel, target.service.value());
            let activeBindings = [];

            if (bindings.length > 1 && target.isArray() === false) {

                // apply constraints if available to reduce the number of active bindings
                activeBindings = bindings.filter((binding) => {

                    let request =  new Request(
                        binding.runtimeIdentifier,
                        parentRequest.parentContext,
                        parentRequest,
                        binding,
                        target
                    );

                    let constraint = binding.constraint;
                    return (typeof constraint === "function") ? constraint(request) : false;

                });

            } else {
                activeBindings = bindings;
            }

            if (activeBindings.length === 0) {

                // no matching bindings found
                throw new Error(`${ERROR_MSGS.NOT_REGISTERED} ${target.service.value()}`);

            } else if (activeBindings.length > 1 && target.isArray() === false) {

                // more than one matching binding found but target is not an array
                throw new Error(`${ERROR_MSGS.AMBIGUOUS_MATCH} ${target.service.value()}`);

            } else {

                // one ore more than one matching bindings found 
                // when more than 1 matching bindings found target is an array 
                this._createChildRequest(parentRequest, target, activeBindings);

            }

        } catch (error) {
            if (error instanceof RangeError) {
                this._throwWhenCircularDependenciesFound(parentRequest.parentContext.plan.rootRequest);
            } else {
                throw new Error(error.message);
            }
        }
    }

    private _createChildRequest(parentRequest: IRequest, target: ITarget, bindings: IBinding<any>[]) {

        // Use the only active binding to create a child request
        let childRequest = parentRequest.addChildRequest(target.service.value(), bindings, target);
        let subChildRequest = childRequest;

        bindings.forEach((binding) => {

            if (target.isArray()) {
                subChildRequest = childRequest.addChildRequest(binding.runtimeIdentifier, binding, target);
            }

            // Only try to plan sub-dependencies when binding type is BindingType.Instance
            if (binding.type === BindingType.Instance) {

                // Create child requests for sub-dependencies if any
                let subDependencies = this._getDependencies(binding.implementationType);
                subDependencies.forEach((d, index) => {
                    this._createSubRequest(subChildRequest, d);
                });
            }

        });
    }

    private _throwWhenCircularDependenciesFound(request: IRequest, previousServices: string[] = []) {

        previousServices.push(request.service);

        request.childRequests.forEach((childRequest) => {

            let service = childRequest.service;
            if (previousServices.indexOf(service) === -1) {
                if (childRequest.childRequests.length > 0) {
                    this._throwWhenCircularDependenciesFound(childRequest, previousServices);
                } else {
                    previousServices.push(service);
                }
            } else {
                throw new Error(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} ${service} and ${request.service}`);
            }

        });
    }

    private _getDependencies(func: Function): Target[] {

        let injections = Reflect.getMetadata(METADATA_KEY.INJECT, func) || [];
        let paramNames = Reflect.getMetadata(METADATA_KEY.PARAM_NAMES, func) || [];
        let tags = Reflect.getMetadata(METADATA_KEY.TAGGED, func) || [];

        return injections.map((inject, index) => {
            let targetName = paramNames[index];
            let target = new Target(targetName, inject);
            target.metadata = tags[index.toString()] || [];
            return target;
        });
    }
}

export default Planner;
