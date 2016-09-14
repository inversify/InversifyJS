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

import interfaces from "../interfaces/interfaces";
import Binding from "../bindings/binding";
import Lookup from "./lookup";
import Planner from "../planning/planner";
import Resolver from "../resolution/resolver";
import * as ERROR_MSGS from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import BindingToSyntax from "../syntax/binding_to_syntax";
import Metadata from "../planning/metadata";
import Target from "../planning/target";
import TargetType from "../planning/target_type";
import { getServiceIdentifierAsString } from "../utils/serialization";
import KernelSnapshot from "./kernel_snapshot";
import guid from "../utils/guid";
// import Request from "../planning/request";

class Kernel implements interfaces.Kernel {

    public guid: string;
    private _planner: Planner;
    private _resolver: Resolver;
    private _middleware: interfaces.PlanAndResolve<any>;
    private _bindingDictionary: interfaces.Lookup<Binding<any>>;
    private _snapshots: Array<KernelSnapshot>;
    private _parentKernel: interfaces.Kernel;

    // Initialize private properties
    public constructor() {
        this.guid = guid();
        this._planner = new Planner();
        this._resolver = new Resolver();
        this._bindingDictionary = new Lookup<Binding<any>>();
        this._middleware = null;
        this._snapshots = [];
    }

    public load(...modules: interfaces.KernelModule[]): void {
        let getBindFunction = (moduleId: string) => {
            return (serviceIdentifier: interfaces.ServiceIdentifier<any>) => {
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

    public unload(...modules: interfaces.KernelModule[]): void {
        modules.forEach((module) => {
            this._bindingDictionary.removeByModuleId(module.guid);
        });
    }

    // Regiters a type binding
    public bind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
        let binding = new Binding<T>(serviceIdentifier);
        this._bindingDictionary.add(serviceIdentifier, binding);
        return new BindingToSyntax<T>(binding);
    }

    // Removes a type binding from the registry by its key
    public unbind(serviceIdentifier: interfaces.ServiceIdentifier<any>): void {
        try {
            this._bindingDictionary.remove(serviceIdentifier);
        } catch (e) {
            throw new Error(`${ERROR_MSGS.CANNOT_UNBIND} ${getServiceIdentifierAsString(serviceIdentifier)}`);
        }
    }

    // Removes all the type bindings from the registry
    public unbindAll(): void {
        this._bindingDictionary = new Lookup<Binding<any>>();
    }

    // Allows to check if there are bindings available for serviceIdentifier
    public isBound(serviceIdentifier: interfaces.ServiceIdentifier<any>): boolean {
        let bindings = this._planner.getBindings<any>(this, serviceIdentifier);
        return bindings.length > 0;
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier must be associated with only one binding
    // use getAll when the runtime identifier is associated with multiple bindings
    public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
        return this._get<T>({
            contextInterceptor: (context: interfaces.Context) => { return context; },
            multiInject: false,
            serviceIdentifier: serviceIdentifier,
            target: null
        })[0];
    }

    public getNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string): T {
        return this.getTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    public getTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string, value: any): T {
        let metadata = new Metadata(key, value);
        let target = new Target(TargetType.ConstructorArgument, null, serviceIdentifier, metadata);
        return this._get<T>({
            contextInterceptor: (context: interfaces.Context) => { return context; },
            multiInject: false,
            serviceIdentifier: serviceIdentifier,
            target: target
        })[0];
    }

    public snapshot(): void {
        this._snapshots.push(KernelSnapshot.of(this._bindingDictionary.clone(), this._middleware));
    }

    public restore(): void {
        if (this._snapshots.length === 0) {
            throw new Error(ERROR_MSGS.NO_MORE_SNAPSHOTS_AVAILABLE);
        }
        let snapshot = this._snapshots.pop();
        this._bindingDictionary = snapshot.bindings;
        this._middleware = snapshot.middleware;
    }

    public applyMiddleware(...middlewares: interfaces.Middleware[]): void {
        let previous: interfaces.PlanAndResolve<any> = (this._middleware) ? this._middleware : this._planAndResolve.bind(this);
        this._middleware = middlewares.reduce((prev, curr) => {
            return curr(prev);
        }, previous);
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier can be associated with one or multiple bindings
    public getAll<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[] {
        return this._get<T>({
            contextInterceptor: (context: interfaces.Context) => { return context; },
            multiInject: true,
            serviceIdentifier: serviceIdentifier,
            target: null
        });
    }

    public getAllNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string): T[] {
        return this.getAllTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    public getAllTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string, value: any): T[] {
        let metadata = new Metadata(key, value);
        let target = new Target(null, null, serviceIdentifier, metadata);
        return this._get<T>({
            contextInterceptor: (context: interfaces.Context) => { return context; },
            multiInject: true,
            serviceIdentifier: serviceIdentifier,
            target: target
        });
    }

    public set parent (kernel: interfaces.Kernel) {
        this._parentKernel = kernel;
    }

    private _get<T>(args: interfaces.PlanAndResolveArgs): T[] {
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

    private _planAndResolve<T>(args: interfaces.PlanAndResolveArgs): T[] {
        let contexts = this._plan(args.multiInject, args.serviceIdentifier, args.target);
        let results = this._resolve<T>(contexts, args.contextInterceptor);
        return results;
    }

    private _plan(
        multiInject: boolean,
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        target: interfaces.Target
    ): interfaces.Context[] {

        let bindings = this._planner.getActiveBindings2(this, multiInject, serviceIdentifier, target);

        let contexts = bindings.map((binding: interfaces.Binding<any>) => {
            return this._createContext(binding, target);
        });

        return contexts;
    }

    private _createContext<T>(binding: interfaces.Binding<T>, target: interfaces.Target): interfaces.Context {
        let context = this._planner.createContext(this);
        this._planner.createPlan(context, binding, target);
        return context;
    }

    private _resolve<T>(
        contexts: interfaces.Context[],
        contextInterceptor: (context: interfaces.Context) => interfaces.Context
    ): T[] {

        let results = contexts.map((context) => {
            return this._resolver.resolve<T>(contextInterceptor(context));
        });
        return results;
    }

}

export default Kernel;
