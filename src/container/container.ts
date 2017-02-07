import { interfaces } from "../interfaces/interfaces";
import { Binding } from "../bindings/binding";
import { Lookup } from "./lookup";
import { plan, createMockRequest, getBindingDictionary } from "../planning/planner";
import { resolve } from "../resolution/resolver";
import { BindingToSyntax } from "../syntax/binding_to_syntax";
import { getServiceIdentifierAsString } from "../utils/serialization";
import { ContainerSnapshot } from "./container_snapshot";
import { guid } from "../utils/guid";
import * as ERROR_MSGS from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import { BindingScopeEnum, TargetTypeEnum } from "../constants/literal_types";

class Container implements interfaces.Container {

    public guid: string;
    public parent: interfaces.Container | null;
    public readonly options: interfaces.ContainerOptions;
    private _middleware: interfaces.Next | null;
    private _bindingDictionary: interfaces.Lookup<interfaces.Binding<any>>;
    private _snapshots: Array<interfaces.ContainerSnapshot>;

    public static merge(container1: interfaces.Container, container2: interfaces.Container): interfaces.Container {

        let container = new Container();
        let bindingDictionary: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container);
        let bindingDictionary1: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container1);
        let bindingDictionary2: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container2);

        function copyDictionary(
            origing: interfaces.Lookup<interfaces.Binding<any>>,
            destination: interfaces.Lookup<interfaces.Binding<any>>
        ) {

            origing.traverse((key, value) => {
                value.forEach((binding) => {
                    destination.add(binding.serviceIdentifier, binding.clone());
                });
            });

        }

        copyDictionary(bindingDictionary1, bindingDictionary);
        copyDictionary(bindingDictionary2, bindingDictionary);

        return container;

    }

    public constructor(containerOptions?: interfaces.ContainerOptions) {

        if (containerOptions !== undefined) {

            if (typeof containerOptions !== "object") {
                throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_MUST_BE_AN_OBJECT}`);
            } else if (containerOptions.defaultScope === undefined) {
                throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_DEFAULT_SCOPE}`);
            } else if (
                containerOptions.defaultScope !== BindingScopeEnum.Singleton &&
                containerOptions.defaultScope !== BindingScopeEnum.Transient
            ) {
                throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_DEFAULT_SCOPE}`);
            }

            this.options = {
                defaultScope: containerOptions.defaultScope
            };

        } else {
            this.options = {
                defaultScope: BindingScopeEnum.Transient
            };
        }

        this.guid = guid();
        this._bindingDictionary = new Lookup<interfaces.Binding<any>>();
        this._snapshots = [];
        this._middleware = null;
        this.parent = null;
    }

    public load(...modules: interfaces.ContainerModule[]): void {

        let setModuleId = (bindingToSyntax: any, moduleId: string) => {
            bindingToSyntax._binding.moduleId = moduleId;
        };

        let getBindFunction = (moduleId: string) => {
            return (serviceIdentifier: interfaces.ServiceIdentifier<any>) => {
                let _bind = this.bind.bind(this);
                let bindingToSyntax = _bind(serviceIdentifier);
                setModuleId(bindingToSyntax, moduleId);
                return bindingToSyntax;
            };
        };

        let getUnbindFunction = (moduleId: string) => {
            return (serviceIdentifier: interfaces.ServiceIdentifier<any>) => {
                let _unbind = this.unbind.bind(this);
                _unbind(serviceIdentifier);
            };
        };

        let getIsboundFunction = (moduleId: string) => {
            return (serviceIdentifier: interfaces.ServiceIdentifier<any>) => {
                let _isBound = this.isBound.bind(this);
                return _isBound(serviceIdentifier);
            };
        };

        let getRebindFunction = (moduleId: string) => {
            return (serviceIdentifier: interfaces.ServiceIdentifier<any>) => {
                let _rebind = this.rebind.bind(this);
                let bindingToSyntax = _rebind(serviceIdentifier);
                setModuleId(bindingToSyntax, moduleId);
                return bindingToSyntax;
            };
        };

        modules.forEach((module) => {

            let bindFunction = getBindFunction(module.guid);
            let unbindFunction = getUnbindFunction(module.guid);
            let isboundFunction = getIsboundFunction(module.guid);
            let rebindFunction = getRebindFunction(module.guid);

            module.registry(
                bindFunction,
                unbindFunction,
                isboundFunction,
                rebindFunction
            );

        });

    }

    public unload(...modules: interfaces.ContainerModule[]): void {

        let conditionFactory = (expected: any) => (item: interfaces.Binding<any>): boolean => {
            return item.moduleId === expected;
        };

        modules.forEach((module) => {
            let condition = conditionFactory(module.guid);
            this._bindingDictionary.removeByCondition(condition);
        });

    }

    // Regiters a type binding
    public bind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
        let defaultScope = BindingScopeEnum.Transient;
        defaultScope = (this.options.defaultScope === defaultScope) ? defaultScope : BindingScopeEnum.Singleton;
        let binding = new Binding<T>(serviceIdentifier, defaultScope);
        this._bindingDictionary.add(serviceIdentifier, binding);
        return new BindingToSyntax<T>(binding);
    }

    public rebind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
        this.unbind(serviceIdentifier);
        return this.bind(serviceIdentifier);
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
        return this._bindingDictionary.hasKey(serviceIdentifier);
    }

    public isBoundNamed(serviceIdentifier: interfaces.ServiceIdentifier<any>, named: string|number|symbol): boolean {
        return this.isBoundTagged(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    // Note: we can only identify basic tagged bindings not complex constraints (e.g ancerstors)
    // Users can try-catch calls to container.get<T>("T") if they really need to do check if a
    // binding with a complex constraint is available.
    public isBoundTagged(serviceIdentifier: interfaces.ServiceIdentifier<any>, key: string|number|symbol, value: any): boolean {
        let bindings = this._bindingDictionary.get(serviceIdentifier);
        let request = createMockRequest(this, serviceIdentifier, key, value);
        return bindings.some((b) => b.constraint(request));
    }

    public snapshot(): void {
        this._snapshots.push(ContainerSnapshot.of(this._bindingDictionary.clone(), this._middleware));
    }

    public restore(): void {
        let snapshot = this._snapshots.pop();
        if (snapshot === undefined) {
            throw new Error(ERROR_MSGS.NO_MORE_SNAPSHOTS_AVAILABLE);
        }
        this._bindingDictionary = snapshot.bindings;
        this._middleware = snapshot.middleware;
    }

    public createChild(): Container {
        let child = new Container();
        child.parent = this;
        return child;
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
        return this._get<T>(false, false, TargetTypeEnum.Variable, serviceIdentifier) as T;
    }

    public getTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string|number|symbol, value: any): T {
        return this._get<T>(false, false, TargetTypeEnum.Variable, serviceIdentifier, key, value) as T;
    }

    public getNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string|number|symbol): T {
        return this.getTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier can be associated with one or multiple bindings
    public getAll<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[] {
        return this._get<T>(true, true, TargetTypeEnum.Variable, serviceIdentifier) as T[];
    }

    public getAllTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string|number|symbol, value: any): T[] {
        return this._get<T>(false, true, TargetTypeEnum.Variable, serviceIdentifier, key, value) as T[];
    }

    public getAllNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string|number|symbol): T[] {
        return this.getAllTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    // Prepares arguments required for resolution and
    // delegates resolution to _middleware if available
    // otherwise it delegates resoltion to _planAndResolve
    private _get<T>(
        avoidConstraints: boolean,
        isMultiInject: boolean,
        targetType: interfaces.TargetType,
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        key?: string|number|symbol,
        value?: any
    ): (T|T[]) {

        let result: (T|T[]) | null = null;

        let defaultArgs: interfaces.NextArgs = {
            avoidConstraints: avoidConstraints,
            contextInterceptor: (context: interfaces.Context) => { return context; },
            isMultiInject: isMultiInject,
            key: key,
            serviceIdentifier: serviceIdentifier,
            targetType: targetType,
            value: value
        };

        if (this._middleware) {
            result = this._middleware(defaultArgs);
            if (result === undefined || result === null) {
                throw new Error(ERROR_MSGS.INVALID_MIDDLEWARE_RETURN);
            }
        } else {
            result = this._planAndResolve<T>()(defaultArgs);
        }

        return result;
    }

    // Planner creates a plan and Resolver resolves a plan
    // one of the jobs of the Container is to links the Planner
    // with the Resolver and that is what this function is about
    private _planAndResolve<T>(): (args: interfaces.NextArgs) => (T|T[]) {
        return (args: interfaces.NextArgs) => {

            // create a plan
            let context = plan(
                this,
                args.isMultiInject,
                args.targetType,
                args.serviceIdentifier,
                args.key,
                args.value,
                args.avoidConstraints
            );

            // apply context interceptor
            context = args.contextInterceptor(context);

            // resolve plan
            let result = resolve<T>(context);
            return result;

        };
    }

}

export { Container };
