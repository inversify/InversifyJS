///<reference path="../interfaces/interfaces.d.ts" />

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

class Kernel implements IKernel {
    private _planner: IPlanner;
    private _resolver: IResolver;
    private _middleware: (context: IContext) => any;
    private _bindingDictionary: ILookup<IBinding<any>>;
    private _snapshots: Array<KernelSnapshot>;

    // Initialize private properties
    public constructor() {
        this._planner = new Planner();
        this._resolver = new Resolver();
        this._bindingDictionary = new Lookup<IBinding<any>>();
        this._middleware = null;
        this._snapshots = [];
    }

    public load(...modules: IKernelModule[]): void {
        modules.forEach((module) => { module(this); });
    }

    public applyMiddleware(...middlewares: IMiddleware[]): void {
        this._middleware = middlewares.reverse().reduce((prev, curr) => {
            return curr(prev);
        }, this._resolver.resolve.bind(this._resolver));
    }

    // Regiters a type binding
    public bind<T>(serviceIdentifier: (string|Symbol|INewable<T>)): IBindingToSyntax<T> {
        let binding = new Binding<T>(serviceIdentifier);
        this._bindingDictionary.add(serviceIdentifier, binding);
        return new BindingToSyntax<T>(binding);
    }

    // Removes a type binding from the registry by its key
    public unbind(serviceIdentifier: (string|Symbol|any)): void {
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

    // Resolves a dependency by its runtime identifier
    // The runtime identifier must be associated with only one binding
    // use getAll when the runtime identifier is associated with multiple bindings
    public get<T>(serviceIdentifier: (string|Symbol|INewable<T>)): T {
        return this._get<T>(serviceIdentifier, null);
    }

    public getNamed<T>(serviceIdentifier: (string|Symbol|INewable<T>), named: string): T {
        return this.getTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    public getTagged<T>(serviceIdentifier: (string|Symbol|INewable<T>), key: string, value: any): T {
        let metadata = new Metadata(key, value);
        let target = new Target(null, serviceIdentifier, metadata);
        return this._get<T>(serviceIdentifier, target);
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier can be associated with one or multiple bindings
    public getAll<T>(serviceIdentifier: (string|Symbol|INewable<T>)): T[] {

        let bindings = this._planner.getBindings<T>(this, serviceIdentifier);

        switch (bindings.length) {

            // CASE 1: There are no bindings
            case BindingCount.NoBindingsAvailable:
                throw new Error(`${ERROR_MSGS.NOT_REGISTERED} ${serviceIdentifier}`);

            // CASE 2: There is AT LEAST 1 binding    
            case BindingCount.OnlyOneBindingAvailable:
            case BindingCount.MultipleBindingsAvailable:
            default:
                return bindings.map((binding) => {
                    return this._planAndResolve<T>(binding, null);
                });
        }
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

    private _get<T>(serviceIdentifier: (string|Symbol|INewable<T>), target: ITarget): T {

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

        if (bindings.length === BindingCount.NoBindingsAvailable) {

            // CASE 1: There are no bindings
            throw new Error(`${ERROR_MSGS.NOT_REGISTERED} ${serviceIdentifier}`);

        } else if (bindings.length === BindingCount.OnlyOneBindingAvailable) {

            // CASE 2: There is 1 binding
            return this._planAndResolve<T>(bindings[0], target);

        } else {

            // CASE 3: There are multiple bindings
            throw new Error(`${ERROR_MSGS.AMBIGUOUS_MATCH} ${serviceIdentifier}`);

        }

    }

    // Generates an executes a resolution plan
    private _planAndResolve<T>(binding: IBinding<T>, target: ITarget): T {

        // STEP 1: generate resolution context
        let context = this._planner.createContext(this);

        // STEP 2: generate a resolutioin plan & link it to the context
        this._planner.createPlan(context, binding, target);

        // STEP 3, 4 & 5: use middleware (optional), execute resolution plan & activation
        return (this._middleware !== null) ? this._middleware(context) : this._resolver.resolve<T>(context);
    }

}

export default Kernel;
