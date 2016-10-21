import interfaces from "../interfaces/interfaces";
import Binding from "../bindings/binding";
import Lookup from "./lookup";
import { plan, getBindings } from "../planning/planner";
import resolve from "../resolution/resolver";
import * as ERROR_MSGS from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import BindingToSyntax from "../syntax/binding_to_syntax";
import TargetType from "../planning/target_type";
import { getServiceIdentifierAsString } from "../utils/serialization";
import KernelSnapshot from "./kernel_snapshot";
import guid from "../utils/guid";

class Kernel implements interfaces.Kernel {

    public guid: string;
    private _middleware: interfaces.Next;
    private _bindingDictionary: interfaces.Lookup<interfaces.Binding<any>>;
    private _snapshots: Array<interfaces.KernelSnapshot>;
    private _parentKernel: interfaces.Kernel;

    // Initialize private properties
    public constructor() {
        this.guid = guid();
        this._bindingDictionary = new Lookup<interfaces.Binding<any>>();
        this._snapshots = [];
        this._middleware = null;
        this._parentKernel = null;
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
        let bindings = getBindings<any>(this, serviceIdentifier);
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

    public set parent (kernel: interfaces.Kernel) {
        this._parentKernel = kernel;
    }

    public get parent() {
        return this._parentKernel;
    }

    public applyMiddleware(...middlewares: interfaces.Middleware[]): void {
        let initial: interfaces.Next = (this._middleware) ? this._middleware : this._planAndResolve();
        this._middleware = middlewares.reduce((prev, curr) => {
            return curr(prev);
        }, initial);
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier must be associated with only one binding
    // use getAll when the runtime identifier is associated with multiple bindings
    public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
        return this._get<T>(false, TargetType.Variable, serviceIdentifier) as T;
    }

    public getTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string, value: any): T {
        return this._get<T>(false, TargetType.Variable, serviceIdentifier, key, value) as T;
    }

    public getNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string): T {
        return this.getTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier can be associated with one or multiple bindings
    public getAll<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[] {
        return this._get<T>(true, TargetType.Variable, serviceIdentifier) as T[];
    }

    public getAllTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string, value: any): T[] {
        return this._get<T>(true, TargetType.Variable, serviceIdentifier, key, value) as T[];
    }

    public getAllNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string): T[] {
        return this.getAllTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    // Prepares arguments required for resolution and 
    // delegates resolution to _middleware if available
    // otherwise it delegates resoltion to _planAndResolve
    private _get<T>(
        isMultiInject: boolean,
        targetType: TargetType,
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        key?: string,
        value?: any
    ): (T|T[]) {

        let result: (T|T[]) = null;

        let args: interfaces.NextArgs = {
            contextInterceptor: (context: interfaces.Context) => { return context; },
            isMultiInject: isMultiInject,
            key: key,
            serviceIdentifier: serviceIdentifier,
            targetType: targetType,
            value: value
        };

        if (this._middleware) {
            result = this._middleware(args);
            if (result === undefined || result === null) {
                throw new Error(ERROR_MSGS.INVALID_MIDDLEWARE_RETURN);
            }
        } else {
            result = this._planAndResolve<T>()(args);
        }

        return result;
    }

    // Planner creates a plan and Resolver resolves a plan
    // one of the jobs of the Kernel is to links the Planner
    // with the Resolver and that is what this function is about
    private _planAndResolve<T>(): (args: interfaces.NextArgs) => (T|T[]) {
        return (args: interfaces.NextArgs) => {
            let context = plan(
                this, args.isMultiInject, args.targetType, args.serviceIdentifier, args.key, args.value
            );
            let result = resolve<T>(args.contextInterceptor(context));
            return result;
        };
    }
}

export default Kernel;
