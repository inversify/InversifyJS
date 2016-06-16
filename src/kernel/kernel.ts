/// <reference path="../interfaces/interfaces.d.ts" />

// Kernel
// ------

// Inversify is a lightweight pico container for TypeScript
// and JavaScript apps.

// A pico container uses a class constructor to identify and
// inject its dependencies. For this to work, the class needs
// to declare a constructor that includes everything it
// needs injected.

// In order to resolve a dependency, the pico container needs
// to be told which implementation type (classes) to associate
// with each service type (interfaces).

import BindingCount from "../bindings/binding_count";
import Binding from "../bindings/binding";
import Lookup from "./lookup";
import Planner from "../planning/planner";
import Resolver from "../resolution/resolver";
import * as ERROR_MSGS from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import BindingToSyntax from "../syntax/binding_to_syntax";
import Metadata from "../planning/metadata";
import Target from "../planning/target";
import Request from "../planning/request";
import KernelSnapshot from "./kernel_snapshot";
import guid from "../utils/guid";

class Kernel implements IKernel {

    public guid: string;
    private _planner: IPlanner;
    private _resolver: IResolver;
    private _middleware: PlanAndResolve<any>;
    private _bindingDictionary: ILookup<IBinding<any>>;
    private _snapshots: Array<KernelSnapshot>;

    // Initialize private properties
    public constructor() {
        this.guid = guid();
        this._planner = new Planner();
        this._resolver = new Resolver();
        this._bindingDictionary = new Lookup<IBinding<any>>();
        this._middleware = null;
        this._snapshots = [];
    }

    public load(...modules: IKernelModule[]): void {
        let getBindFunction = (moduleId: string) => {
            return (serviceIdentifier: (string|Symbol|INewable<any>)) => {
                let _bind = this.bind.bind(this);
                let bindingToSyntax = _bind(serviceIdentifier);
                (<any>bindingToSyntax)._binding.moduleId = moduleId;
                return bindingToSyntax;
            };
        };
        modules.forEach((module) => {
            let bindFunction = getBindFunction(module.guid);
            module.registry(bindFunction);
        });
    }

    public unload(...modules: IKernelModule[]): void {
        modules.forEach((module) => {
            this._bindingDictionary.removeByModuleId(module.guid);
        });
    }

    // Regiters a type binding
    public bind<T>(serviceIdentifier: (string|Symbol|INewable<T>)): IBindingToSyntax<T> {
        let binding = new Binding<T>(serviceIdentifier);
        this._bindingDictionary.add(serviceIdentifier, binding);
        return new BindingToSyntax<T>(binding);
    }

    // Removes a type binding from the registry by its key
    public unbind(serviceIdentifier: (string|Symbol|INewable<any>)): void {
        try {
            this._bindingDictionary.remove(serviceIdentifier);
        } catch (e) {
            throw new Error(`${ERROR_MSGS.CANNOT_UNBIND} ${serviceIdentifier}`);
        }
    }

    // Removes all the type bindings from the registry
    public unbindAll(): void {
        this._bindingDictionary = new Lookup<IBinding<any>>();
    }

    // Allows to check if there are bindings available for serviceIdentifier
    public isBound(serviceIdentifier: (string|Symbol|INewable<any>)): boolean {
        let bindings = this._planner.getBindings<any>(this, serviceIdentifier);
        return bindings.length > 0;
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier must be associated with only one binding
    // use getAll when the runtime identifier is associated with multiple bindings
    public get<T>(serviceIdentifier: (string|Symbol|INewable<T>)): T {
        return this._get<T>({
            contextInterceptor: (context: IContext) =>  { return context; },
            multiInject: false,
            serviceIdentifier: serviceIdentifier,
            target: null
        })[0];
    }

    public getNamed<T>(serviceIdentifier: (string|Symbol|INewable<T>), named: string): T {
        return this.getTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    public getTagged<T>(serviceIdentifier: (string|Symbol|INewable<T>), key: string, value: any): T {
        let metadata = new Metadata(key, value);
        let target = new Target(null, serviceIdentifier, metadata);
        return this._get<T>({
            contextInterceptor: (context: IContext) =>  { return context; },
            multiInject: false,
            serviceIdentifier: serviceIdentifier,
            target: target
        })[0];
    }

    public snapshot (): void {
        this._snapshots.push(KernelSnapshot.of(this._bindingDictionary.clone(), this._middleware));
    }

    public restore (): void {
        if (this._snapshots.length === 0) {
            throw new Error(ERROR_MSGS.NO_MORE_SNAPSHOTS_AVAILABLE);
        }
        let snapshot = this._snapshots.pop();
        this._bindingDictionary = snapshot.bindings;
        this._middleware = snapshot.middleware;
    }

    public getServiceIdentifierAsString(serviceIdentifier: (string|Symbol|INewable<any>)): string {
        let type = typeof serviceIdentifier;
        if (type === "function") {
            let _serviceIdentifier: any = serviceIdentifier;
            return _serviceIdentifier.name;
        } else if (type === "symbol") {
            return serviceIdentifier.toString();
        } else { // string
            let _serviceIdentifier: any = serviceIdentifier;
            return _serviceIdentifier;
        }
    }

    public applyMiddleware(...middlewares: IMiddleware[]): void {
        let previous: PlanAndResolve<any> = (this._middleware) ? this._middleware : this._planAndResolve.bind(this);
        this._middleware = middlewares.reduce((prev, curr) => {
            return curr(prev);
        }, previous);
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier can be associated with one or multiple bindings
    public getAll<T>(serviceIdentifier: (string|Symbol|INewable<T>)): T[] {
        return this._get<T>({
            contextInterceptor: (context: IContext) =>  { return context; },
            multiInject: true,
            serviceIdentifier: serviceIdentifier,
            target: null
        });
    }

    private _get<T>(args: PlanAndResolveArgs): T[] {
        let result: T[] = null;
        if (this._middleware) {
            result = this._middleware(args);
        } else {
            result = this._planAndResolve<T>(args);
        }
        if (Array.isArray(result) === false) {
            throw new Error(ERROR_MSGS.INVALID_MIDDLEWARE_RETURN);
        }
        return result;
    }

    private _planAndResolve<T>(args: PlanAndResolveArgs): T[] {
        let contexts = this._plan<T>(args.multiInject, args.serviceIdentifier, args.target);
        let results = this._resolve<T>(contexts, args.contextInterceptor);
        return results;
    }

    private _getActiveBindings<T>(multiInject: boolean, serviceIdentifier: (string|Symbol|INewable<T>), target: ITarget): IBinding<T>[] {

        let bindings = this._planner.getBindings<T>(this, serviceIdentifier);

        // Filter bindings using the target and the binding constraints
        if (target !== null) {

            let request = new Request(
                serviceIdentifier,
                this._planner.createContext(this),
                null,
                bindings,
                target
            );

            bindings = this._planner.getActiveBindings(request, target);
        }

        switch (bindings.length) {

            case BindingCount.NoBindingsAvailable:
                throw new Error(`${ERROR_MSGS.NOT_REGISTERED} ${serviceIdentifier}`);

            case BindingCount.OnlyOneBindingAvailable:
                if (multiInject === false) {
                    return bindings;
                }

            case BindingCount.MultipleBindingsAvailable:
            default:
                if (multiInject === false) {
                    throw new Error(`${ERROR_MSGS.AMBIGUOUS_MATCH} ${serviceIdentifier}`);
                } else {
                    return bindings;
                }
        }

    }

    private _plan<T>(multiInject: boolean, serviceIdentifier: (string|Symbol|INewable<T>), target: ITarget): IContext[] {

        let bindings = this._getActiveBindings(multiInject, serviceIdentifier, target);

        let contexts = bindings.map((binding) => {
            return this._createContext(binding, target);
        });

        return contexts;
    }

    private _createContext<T>(binding: IBinding<T>, target: ITarget): IContext {
        let context = this._planner.createContext(this);
        this._planner.createPlan(context, binding, target);
        return context;
    }

    private _resolve<T>(contexts: IContext[], contextInterceptor: (context: IContext) => IContext): T[] {
        let results = contexts.map((context) => {
            return this._resolver.resolve<T>(contextInterceptor(context));
        });
        return results;
    }

}

export default Kernel;
