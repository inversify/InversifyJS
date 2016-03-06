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
        if (_bindingDictionary.hasKey(service)) {
            bindings = _bindingDictionary.get(service);
        }
        return bindings;
    }

    private _createSubRequest(parentRequest: IRequest, target: ITarget) {

        try {
            let bindings = this.getBindings<any>(parentRequest.parentContext.kernel, target.service.value());

            // mutiple bindings available
            if (bindings.length > 1) {

                // TODO 2.0.0-alpha.3 
                // TODO handle multi-injection, named, tagged and contextual binsingd here
                throw new Error(`${ERROR_MSGS.AMBIGUOUS_MATCH} ${target.service.value()}`);

            } else {

                // TODO 2.0.0-alpha.2 handle value, factory, etc here
                let binding = bindings[0];

                switch (binding.type) {
                    case BindingType.Value:
                        break;
                    case BindingType.Constructor:
                        break;
                    case BindingType.Factory:
                        break;
                    case BindingType.Provider:
                        break;
                    case BindingType.Instance:
                    default:
                        let childRequest = parentRequest.addChildRequest(target.service.value(), binding, target);
                        let subDependencies = this._getDependencies(binding.implementationType);

                        subDependencies.forEach((d, index) => {
                            this._createSubRequest(childRequest, d);
                        });

                        break;
                }
            }
        } catch (error) {
            if (error instanceof RangeError) {
                this._throwWhenCircularDependenciesFound(parentRequest.parentContext.plan.rootRequest);
            } else {
                throw new Error(error.message);
            }
        }
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
