import interfaces from "../interfaces/interfaces";
import Binding from "../bindings/binding";
import Lookup from "./lookup";
import Planner from "../planning/planner";
import resolve from "../resolution/resolver";
import * as ERROR_MSGS from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import BindingToSyntax from "../syntax/binding_to_syntax";
import TargetType from "../planning/target_type";
import { getServiceIdentifierAsString } from "../utils/serialization";
import KernelSnapshot from "./kernel_snapshot";
import guid from "../utils/guid";

import Request from "../planning/request";

class Kernel implements interfaces.Kernel {

    public guid: string;
    private _planner: interfaces.Planner;
    private _resolve: <T>(context: interfaces.Context) => T;
    private _middleware: interfaces.Next;
    private _bindingDictionary: interfaces.Lookup<Binding<any>>;
    private _snapshots: Array<interfaces.KernelSnapshot>;
    private _parentKernel: interfaces.Kernel;

    // Initialize private properties
    public constructor() {
        this.guid = guid();
        this._planner = new Planner();
        this._resolve = resolve;
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
        let initial: interfaces.Next = (this._middleware) ? this._middleware : this._planAndResolve();
        this._middleware = middlewares.reduce((prev, curr) => {
            return curr(prev);
        }, initial);
    }

    public set parent (kernel: interfaces.Kernel) {
        this._parentKernel = kernel;
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier must be associated with only one binding
    // use getAll when the runtime identifier is associated with multiple bindings
    public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
        let target = this._planner.createTarget(false, TargetType.Variable, serviceIdentifier);
        return this._get<T>(serviceIdentifier, target)[0]; // TODO no need for index 0
    }

    public getTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string, value: any): T {
        let target = this._planner.createTarget(false, TargetType.Variable, serviceIdentifier, key, value);
        return this._get<T>(serviceIdentifier, target)[0]; // TODO no need for index 0
    }

    public getNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string): T {
        return this.getTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier can be associated with one or multiple bindings
    public getAll<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[] {
        let target = this._planner.createTarget(true, TargetType.Variable, serviceIdentifier);
        return this._get<T>(serviceIdentifier, target);
    }

    public getAllTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string, value: any): T[] {
        let target = this._planner.createTarget(true, TargetType.Variable, serviceIdentifier, key, value);
        return this._get<T>(serviceIdentifier, target);
    }

    public getAllNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string): T[] {
        return this.getAllTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    private _get<T>(
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        target: interfaces.Target
    ): T[] { // TODO support for array and non-array return

        let result: T[] = null;
        let args: interfaces.NextArgs = {
            contextInterceptor: (context: interfaces.Context) => { return context; },
            serviceIdentifier: serviceIdentifier,
            target: target
        };

        if (this._middleware) {
            result = this._middleware(args);
        } else {
            result = this._planAndResolve<T>()(args);
        }

        if (Array.isArray(result) === false) {
            throw new Error(ERROR_MSGS.INVALID_MIDDLEWARE_RETURN);
        }

        return result;
    }

    private _planAndResolve<T>(): (args: interfaces.NextArgs) => T[] {
        return (args: interfaces.NextArgs) => {

            let contexts = this._plan(args.serviceIdentifier, args.target);
            let results = this._resolveContexts<T>(contexts, args.contextInterceptor);

            // TODO 
            // let context = this._planner.plan(args.serviceIdentifier, args.target);
            // let results = this._resolver.resolve<T>(args.contextInterceptor(context));
            return results;
        };
    }

    // !!!!! TODO below will be refactored into the Planner!!!!!

    private _plan(
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        target: interfaces.Target
    ): interfaces.Context[] {

        let bindings = this._planner.getBindings<any>(this, serviceIdentifier);

        // Filter bindings using the target and the binding constraints
        let request = new Request(
            serviceIdentifier,
            this._planner.createContext(this),
            null,
            bindings,
            target
        );

        bindings = this._planner.getActiveBindings(this, request, target);
        bindings = this._planner.validateActiveBindingCount(serviceIdentifier, bindings, target, this);

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

    private _resolveContexts<T>(
        contexts: interfaces.Context[],
        contextInterceptor: (context: interfaces.Context) => interfaces.Context
    ): T[] {

        let results = contexts.map((context) => {
            return this._resolve<T>(contextInterceptor(context));
        });
        return results;
    }

}

export default Kernel;
