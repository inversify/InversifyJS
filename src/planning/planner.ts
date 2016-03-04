///<reference path="../interfaces/interfaces.d.ts" />

import "reflect-metadata";
import Plan from "./plan";
import Context from "./context";
import Request from "./request";
import Target from "./target";
import * as METADATA_KEY from "../constants/metadata_keys";
import * as ERROR_MSGS from "../constants/error_msgs";

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

        let dependencies = this._getDependencies(binding.implementationType);

        dependencies.forEach((d) => { this._createSubRequest(rootRequest, d); });
        return plan;
    }

    private _createSubRequest(parentRequest: IRequest, target: ITarget) {

        try {
            let bindings = this._getBindings(parentRequest.parentContext, target.service.value());

            // mutiple bindings available
            if (bindings.length > 1) {

                // TODO 2.0.0-alpha.3 
                // TODO handle multi-injection, named, tagged and contextual binsingd here
                throw new Error(`${ERROR_MSGS.AMBIGUOUS_MATCH} ${target.service.value()}`);

            } else {

                // TODO 2.0.0-alpha.2 handle value, factory, etc here
                let binding = bindings[0];

                let childRequest = parentRequest.addChildRequest(target.service.value(), binding, target);

                let subDependencies = this._getDependencies(binding.implementationType);

                subDependencies.forEach((d, index) => {
                    this._createSubRequest(childRequest, d);
                });
            }
        } catch (error) {
            if (error instanceof RangeError) {
                throw new Error(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} ${target.service.value()}`);
            } else {
                throw new Error(error.message);
            }
        }
    }

    private _getBindings(context: IContext, service: string) {
        let kernel: any = context.kernel;
        let bindingDictionary: ILookup<IBinding<any>> = kernel._bindingDictionary;
        return bindingDictionary.get(service);
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
