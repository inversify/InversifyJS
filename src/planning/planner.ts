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

    public createPlan(context: IContext, binding: IBinding<any>, target: ITarget): IPlan {

        let rootRequest = new Request(
            binding.serviceIdentifier,
            context,
            null,
            binding,
            target);

        let plan = new Plan(context, rootRequest);

        // Plan and Context are duable linked
        context.addPlan(plan);

        let dependencies = this._getDependencies(binding.implementationType);
        dependencies.forEach((dependency) => { this._createSubRequest(rootRequest, dependency); });
        return plan;
    }

    public getBindings<T>(kernel: IKernel, serviceIdentifier: (string|Symbol|INewable<T>)): IBinding<T>[] {
        let bindings: IBinding<T>[] = [];
        let _kernel: any = kernel;
        let _bindingDictionary = _kernel._bindingDictionary;
        if (_bindingDictionary.hasKey(serviceIdentifier)) {
            bindings = _bindingDictionary.get(serviceIdentifier);
        }
        return bindings;
    }

    public getActiveBindings(parentRequest: IRequest, target: ITarget): IBinding<any>[] {

        let bindings = this.getBindings<any>(parentRequest.parentContext.kernel, target.serviceIdentifier);
        let activeBindings: IBinding<any>[] = [];

        if (bindings.length > 1 && target.isArray() === false) {

            // apply constraints if available to reduce the number of active bindings
            activeBindings = bindings.filter((binding) => {

                let request =  new Request(
                    binding.serviceIdentifier,
                    parentRequest.parentContext,
                    parentRequest,
                    binding,
                    target
                );

                return binding.constraint(request);

            });

        } else {
            activeBindings = bindings;
        }

        return activeBindings;
    }

    private _createSubRequest(parentRequest: IRequest, target: ITarget) {

        try {
            let activeBindings = this.getActiveBindings(parentRequest, target);

            if (activeBindings.length === 0) {

                // no matching bindings found
                let serviceIdentifier = parentRequest.parentContext.kernel.getServiceIdentifierAsString(target.serviceIdentifier);
                throw new Error(`${ERROR_MSGS.NOT_REGISTERED} ${serviceIdentifier}`);

            } else if (activeBindings.length > 1 && target.isArray() === false) {

                // more than one matching binding found but target is not an array
                let serviceIdentifier = parentRequest.parentContext.kernel.getServiceIdentifierAsString(target.serviceIdentifier);
                throw new Error(`${ERROR_MSGS.AMBIGUOUS_MATCH} ${serviceIdentifier}`);

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
        let childRequest = parentRequest.addChildRequest(target.serviceIdentifier, bindings, target);
        let subChildRequest = childRequest;

        bindings.forEach((binding) => {

            if (target.isArray()) {
                subChildRequest = childRequest.addChildRequest(binding.serviceIdentifier, binding, target);
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

    private _throwWhenCircularDependenciesFound(
        request: IRequest, previousServiceIdentifiers: (string|Symbol|INewable<any>)[] = []
    ) {

        previousServiceIdentifiers.push(request.serviceIdentifier);

        request.childRequests.forEach((childRequest) => {

            let serviceIdentifier = childRequest.serviceIdentifier;
            if (previousServiceIdentifiers.indexOf(serviceIdentifier) === -1) {
                if (childRequest.childRequests.length > 0) {
                    this._throwWhenCircularDependenciesFound(childRequest, previousServiceIdentifiers);
                } else {
                    previousServiceIdentifiers.push(serviceIdentifier);
                }
            } else {
                let tailServiceIdentifier = request.parentContext.kernel.getServiceIdentifierAsString(request.serviceIdentifier);
                throw new Error(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} ${serviceIdentifier} and ${tailServiceIdentifier}`);
            }

        });
    }

    private _getDependencies(func: Function): ITarget[] {

        if (func === null) { return []; }
        let constructorName = (<any>func).name;

        // TypeScript compiler generated annotations
        let targetsTypes = Reflect.getMetadata(METADATA_KEY.PARAM_TYPES, func);

        // All types resolved bust be annotated with @injectable
        if (targetsTypes === undefined) {
            let msg = `${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} ${constructorName}.`;
            throw new Error(msg);
        }

        // User generated annotations
        let targetsMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED, func) || [];

        let targets: ITarget[] = [];

        for (let i = 0; i < func.length; i++) {

            let targetType = targetsTypes[i];
            // Create map from array of metadata for faster access to metadata
            let targetMetadata = targetsMetadata[i.toString()] || [];
            let targetMetadataMap: any = {};
            targetMetadata.forEach((m: IMetadata) => {
                targetMetadataMap[m.key.toString()] = m.value;
            });

            // user generated metadata
            let inject: any = targetMetadataMap[METADATA_KEY.INJECT_TAG];
            let multiInject: any = targetMetadataMap[METADATA_KEY.MULTI_INJECT_TAG];
            let targetName: any = targetMetadataMap[METADATA_KEY.NAME_TAG];

            // Take type to be injected from user-generated metadata
            // if not available use compiler-generated metadata
            targetType = (inject || multiInject) ? (inject || multiInject) : targetType;

            // Types Object and Function are too ambiguous to be resolved
            // user needs to generate metadata manually for those
            if (targetType === Object || targetType === Function || targetType === undefined) {
                let msg = `${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument ${i} in class ${constructorName}.`;
                throw new Error(msg);
            }

            // Create target
            let target = new Target(targetName, targetType);
            target.metadata = targetMetadata;
            targets.push(target);

        }

        // Throw if a derived class does not implement its constructor explicitly
        // We do this to prevent errors when a base class (parent) has dependencies
        // and one of the derived classes (children) has no dependencies
        if (targets.length === 0 && this._baseClassHasDepencencies(func)) {
            throw new Error(`${ERROR_MSGS.MISSING_EXPLICIT_CONSTRUCTOR} ${constructorName}.`);
        }

        return targets;
    }

    private _baseClassHasDepencencies(func: Function): boolean {
        let baseConstructor = Object.getPrototypeOf(func.prototype).constructor;

        if (baseConstructor !== Object) {
            let targetsTypes = Reflect.getMetadata(METADATA_KEY.PARAM_TYPES, baseConstructor);

            if (baseConstructor.length > 0 && targetsTypes) {
                return true;
            } else {
                return this._baseClassHasDepencencies(baseConstructor);
            }
        } else {
            return false;
        }
    }
}

export default Planner;
