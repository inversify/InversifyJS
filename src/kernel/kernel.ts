///<reference path="../interfaces/interfaces.d.ts" />

// Kernel
// ------

// Inversify is a lightweight pico container for TypeScript
// and JavaScript apps.

// A pico container uses a class constructor to identify and
// inject its dependencies. For this to work, the class needs
// to declare a constructor that includes everything it
// needs injected.

// In order to resolve a depencency, the pico container needs
// to be told which implementation type (classes) to associate
// with each service type (interfaces).

import BindingCount from "../bindings/binding_count";
import Binding from "../bindings/binding";
import Lookup from "./lookup";
import Planner from "../planning/planner";
import Resolver from "../resolution/resolver";
import * as ERROR_MSGS from "../constants/error_msgs";
import BindingToSyntax from "../syntax/binding_to_syntax";

class Kernel implements IKernel {

    private _planner: IPlanner;
    private _resolver: IResolver;
    private _middleware: (context: IContext) => any;
    private _bindingDictionary: ILookup<IBinding<any>>;

    // Initialize private properties
    public constructor() {
        this._planner = new Planner();
        this._resolver = new Resolver();
        this._bindingDictionary = new Lookup<IBinding<any>>();
        this._middleware = null;
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
    public bind<T>(runtimeIdentifier: (string|Symbol|INewable<T>)): IBindingToSyntax<T> {
        let binding = new Binding<T>(runtimeIdentifier);
        this._bindingDictionary.add(runtimeIdentifier, binding);
        return new BindingToSyntax<T>(binding);
    }

    // Removes a type binding from the registry by its key
    public unbind(runtimeIdentifier: (string|Symbol|any)): void {
        try {
            this._bindingDictionary.remove(runtimeIdentifier);
        } catch (e) {
            throw new Error(`${ERROR_MSGS.CANNOT_UNBIND} ${runtimeIdentifier}`);
        }
    }

    // Removes all the type bindings from the registry
    public unbindAll(): void {
        this._bindingDictionary = new Lookup<IBinding<any>>();
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier must be associated with only one binding
    // use getAll when the runtime identifier is associated with multiple bindings
    public get<T>(runtimeIdentifier: (string|Symbol|INewable<T>)): T {

        let bindings = this._planner.getBindings<T>(this, runtimeIdentifier);

        switch (bindings.length) {

            // CASE 1: There are no bindings
            case BindingCount.NoBindingsAvailable:
                throw new Error(`${ERROR_MSGS.NOT_REGISTERED} ${runtimeIdentifier}`);

            // CASE 2: There is 1 binding 
            case BindingCount.OnlyOneBindingAvailable:
                return this._planAndResolve<T>(bindings[0]);

            // CASE 3: There are multiple bindings throw as don't have enough information (metadata)    
            case BindingCount.MultipleBindingsAvailable:
            default:
                throw new Error(`${ERROR_MSGS.AMBIGUOUS_MATCH} ${runtimeIdentifier}`);
        }
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier can be associated with one or multiple bindings
    public getAll<T>(runtimeIdentifier: (string|Symbol|INewable<T>)): T[] {

        let bindings = this._planner.getBindings<T>(this, runtimeIdentifier);

        switch (bindings.length) {

            // CASE 1: There are no bindings
            case BindingCount.NoBindingsAvailable:
                throw new Error(`${ERROR_MSGS.NOT_REGISTERED} ${runtimeIdentifier}`);

            // CASE 2: There is AT LEAST 1 binding    
            case BindingCount.OnlyOneBindingAvailable:
            case BindingCount.MultipleBindingsAvailable:
            default:
                return bindings.map((binding) => {
                    return this._planAndResolve<T>(binding);
                });
        }
    }

    // Generates an executes a resolution plan
    private _planAndResolve<T>(binding: IBinding<T>): T {

        // STEP 1: generate resolution context
        let context = this._planner.createContext(this);

        // STEP 2: generate a resolutioin plan & link it to the context
        this._planner.createPlan(context, binding);

        // STEP 3, 4 & 5: use middleware (optional), execute resolution plan & activation
        return (this._middleware !== null) ? this._middleware(context) : this._resolver.resolve<T>(context);
    }

}

export default Kernel;
