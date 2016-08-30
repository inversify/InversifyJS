import interfaces from "../interfaces/interfaces";
import Plan from "./plan";
import Context from "./context";
import Request from "./request";
import Target from "./target";
import * as METADATA_KEY from "../constants/metadata_keys";
import * as ERROR_MSGS from "../constants/error_msgs";
import BindingType from "../bindings/binding_type";
import { getFunctionName } from "../utils/utils";
import TargetType from "./target_type";

class Planner implements interfaces.Planner {

    public createContext(kernel: interfaces.Kernel): interfaces.Context {
        return new Context(kernel);
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
            let dependencies = this._getDependencies(binding.implementationType);
            dependencies.forEach((dependency) => { this._createSubRequest(rootRequest, dependency); });
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
        parentRequest: interfaces.Request,
        target: interfaces.Target
    ): interfaces.Binding<any>[] {

        let bindings = this.getBindings<any>(parentRequest.parentContext.kernel, target.serviceIdentifier);
        let activeBindings: interfaces.Binding<any>[] = [];

        if (bindings.length > 1 && target.isArray() === false) {

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
            activeBindings = bindings;
        }

        return activeBindings;
    }

    private _createSubRequest(parentRequest: interfaces.Request, target: interfaces.Target) {

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

    private _createChildRequest(
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
                let subDependencies = this._getDependencies(binding.implementationType);
                subDependencies.forEach((d, index) => {
                    this._createSubRequest(subChildRequest, d);
                });
            }

        });
    }

    private _throwWhenCircularDependenciesFound(
        request: interfaces.Request,
        previousServiceIdentifiers: interfaces.ServiceIdentifier<any>[] = []
    ) {

        // Add to list so we know that we have already visit this node in the request tree
        let parentServiceIdentifier = request.parentContext.kernel.getServiceIdentifierAsString(request.serviceIdentifier);
        previousServiceIdentifiers.push(parentServiceIdentifier);

        // iterate child requests
        request.childRequests.forEach((childRequest) => {

            // the service identifier of a child request
            let childServiceIdentifier = request.parentContext.kernel.getServiceIdentifierAsString(childRequest.serviceIdentifier);

            // check if the child request has been already visited
            if (previousServiceIdentifiers.indexOf(childServiceIdentifier) === -1) {

                if (childRequest.childRequests.length > 0) {
                    // use recursion to continue traversing the request tree
                    this._throwWhenCircularDependenciesFound(childRequest, previousServiceIdentifiers);
                } else {
                    // the node has no child so we add it to list to know that we have already visit this node
                    previousServiceIdentifiers.push(childServiceIdentifier);
                }

            } else {

                // create description of circular dependency
                let services = previousServiceIdentifiers.reduce((prev, curr) => {
                    return (prev !== "") ? `${prev} -> ${curr}`: `${curr}`;
                }, "");

                // throw when we have already visit this node in the request tree
                throw new Error(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} ${services}`);

            }

        });

    }

    private _formatTargetMetadata(targetMetadata: any[]) {

        // Create map from array of metadata for faster access to metadata
        let targetMetadataMap: any = {};
        targetMetadata.forEach((m: interfaces.Metadata) => {
            targetMetadataMap[m.key.toString()] = m.value;
        });

        // user generated metadata
        return {
            inject : targetMetadataMap[METADATA_KEY.INJECT_TAG],
            multiInject: targetMetadataMap[METADATA_KEY.MULTI_INJECT_TAG],
            targetName: targetMetadataMap[METADATA_KEY.NAME_TAG],
            unmanaged: targetMetadataMap[METADATA_KEY.UNMANAGED_TAG]
        };

    }

    private _getTargets(func: Function, isBaseClass: boolean): interfaces.Target[] {

        let constructorName = getFunctionName(func);

        // TypeScript compiler generated annotations
        let serviceIdentifiers = Reflect.getMetadata(METADATA_KEY.PARAM_TYPES, func);

        // All types resolved bust be annotated with @injectable
        if (serviceIdentifiers === undefined) {
            let msg = `${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} ${constructorName}.`;
            throw new Error(msg);
        }

        // User generated annotations
        let constructorArgsMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED, func) || [];

        let targets = [
            ...(this._constructorArgsTargets(isBaseClass, constructorName, serviceIdentifiers, constructorArgsMetadata, func.length)),
            ...(this._getClassPropsTargets(func))
        ];

        return targets;

    }

    private _constructorArgsTargets(
        isBaseClass: boolean,
        constructorName: string,
        serviceIdentifiers: any,
        constructorArgsMetadata: any,
        constructorLength: number
    ) {

        let targets: interfaces.Target[] = [];

        for (let i = 0; i < constructorLength; i++) {

            // Create map from array of metadata for faster access to metadata
            let targetMetadata = constructorArgsMetadata[i.toString()] || [];
            let metadata = this._formatTargetMetadata(targetMetadata);

            // Take types to be injected from user-generated metadata
            // if not available use compiler-generated metadata
            let serviceIndentifier = serviceIdentifiers[i];
            serviceIndentifier = (metadata.inject || metadata.multiInject) ? (metadata.inject || metadata.multiInject) : serviceIndentifier;

            // Types Object and Function are too ambiguous to be resolved
            // user needs to generate metadata manually for those
            let isUnknownType = (serviceIndentifier === Object || serviceIndentifier === Function || serviceIndentifier === undefined);

            if (isBaseClass === false && isUnknownType) {
                let msg = `${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument ${i} in class ${constructorName}.`;
                throw new Error(msg);
            }

            // Create target
            let target = new Target(TargetType.ConstructorArgument, metadata.targetName, serviceIndentifier);
            target.metadata = targetMetadata;
            targets.push(target);

        }

        return targets;
    }

    private _getClassPropsTargets(func: Function) {

        let classPropsMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED_PROP, func) || [];
        let targets: interfaces.Target[] = [];
        let keys = Object.keys(classPropsMetadata);

        for (let i = 0; i < keys.length; i++) {

            // the key of the property being injected
            let key = keys[i];

            // the metadata for the property being injected
            let targetMetadata = classPropsMetadata[key];

            // the metadata formatted for easier access
            let metadata = this._formatTargetMetadata(classPropsMetadata[key]);

            // the name of the property being injected
            let targetName = metadata.targetName || key;

            // Take types to be injected from user-generated metadata
            let serviceIndentifier = (metadata.inject || metadata.multiInject);

            // The property target
            let target = new Target(TargetType.ClassProperty, targetName, serviceIndentifier);
            target.metadata = targetMetadata;
            targets.push(target);
        }

        // Check if base class has injected properties
        let baseConstructor = Object.getPrototypeOf(func.prototype).constructor;

        if (baseConstructor !== Object) {

            let baseTargets = this._getClassPropsTargets(baseConstructor);

            targets = [
                ...targets,
                ...baseTargets
            ];

        }

        return targets;
    }

    private _getDependencies(func: Function): interfaces.Target[] {

        let constructorName = getFunctionName(func);
        let targets: interfaces.Target[] = this._getTargets(func, false);

        // Throw if a derived class does not implement its constructor explicitly
        // We do this to prevent errors when a base class (parent) has dependencies
        // and one of the derived classes (children) has no dependencies
        let baseClassDepencencyCount = this._baseClassDepencencyCount(func);
        if (targets.length < baseClassDepencencyCount) {
            let error = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_1 + constructorName + ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_2;
            throw new Error(error);
        }

        return targets;
    }

    private _baseClassDepencencyCount(func: Function): number {

        let baseConstructor = Object.getPrototypeOf(func.prototype).constructor;

        if (baseConstructor !== Object) {

            let targets = this._getTargets(baseConstructor, true);

            let metadata: any[] = targets.map((t: interfaces.Target) => {
                return t.metadata.filter((m: interfaces.Metadata) => {
                    return m.key === METADATA_KEY.UNMANAGED_TAG;
                });
            });

            let unmanagedCount = [].concat.apply([], metadata).length;
            let dependencyCount = targets.length - unmanagedCount;

            if (dependencyCount > 0 ) {
                return dependencyCount;
            } else {
                return this._baseClassDepencencyCount(baseConstructor);
            }

        } else {
            return 0;
        }

    }
}

export default Planner;
