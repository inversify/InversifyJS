import { Binding } from "../bindings/binding";
import * as ERROR_MSGS from "../constants/error_msgs";
import { BindingScopeEnum, TargetTypeEnum } from "../constants/literal_types";
import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { MetadataReader } from "../planning/metadata_reader";
import { createMockRequest, getBindingDictionary, plan } from "../planning/planner";
import { resolve } from "../resolution/resolver";
import { BindingToSyntax } from "../syntax/binding_to_syntax";
import { id } from "../utils/id";
import { getServiceIdentifierAsString } from "../utils/serialization";
import { ContainerSnapshot } from "./container_snapshot";
import { Lookup } from "./lookup";

class Container implements interfaces.Container {

    public id: number;
    public parent: interfaces.Container | null;
    public readonly options: interfaces.ContainerOptions;
    private _middleware: interfaces.Next | null;
    private _bindingDictionary: interfaces.Lookup<interfaces.Binding<any>>;
    private _snapshots: interfaces.ContainerSnapshot[];
    private _metadataReader: interfaces.MetadataReader;

    private _snapshotSingletonCloneDeep: interfaces.SnapshotSingletonCustomCloneDeep<any> | undefined;

    public static merge(container1: interfaces.Container, container2: interfaces.Container): interfaces.Container {

        const container = new Container();
        const bindingDictionary: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container);
        const bindingDictionary1: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container1);
        const bindingDictionary2: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container2);

        function copyDictionary(
            origin: interfaces.Lookup<interfaces.Binding<any>>,
            destination: interfaces.Lookup<interfaces.Binding<any>>
        ) {

            origin.traverse((key, value) => {
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
        const options = containerOptions || {};
        if (options.snapshotSingletonCloneDeep !== undefined) {
            this._snapshotSingletonCloneDeep = options.snapshotSingletonCloneDeep;
        }
        if (typeof options !== "object") {
            throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_MUST_BE_AN_OBJECT}`);
        }

        if (options.defaultScope === undefined) {
            options.defaultScope = BindingScopeEnum.Transient;
        } else if (
            options.defaultScope !== BindingScopeEnum.Singleton &&
            options.defaultScope !== BindingScopeEnum.Transient &&
            options.defaultScope !== BindingScopeEnum.Request
        ) {
            throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_DEFAULT_SCOPE}`);
        }

        if (options.autoBindInjectable === undefined) {
            options.autoBindInjectable = false;
        } else if (
            typeof options.autoBindInjectable !== "boolean"
        ) {
            throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_AUTO_BIND_INJECTABLE}`);
        }

        if (options.skipBaseClassChecks === undefined) {
            options.skipBaseClassChecks = false;
        } else if (
            typeof options.skipBaseClassChecks !== "boolean"
        ) {
            throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_SKIP_BASE_CHECK}`);
        }

        this.options = {
            autoBindInjectable: options.autoBindInjectable,
            defaultScope: options.defaultScope,
            skipBaseClassChecks: options.skipBaseClassChecks
        };

        this.id = id();
        this._bindingDictionary = new Lookup<interfaces.Binding<any>>();
        this._snapshots = [];
        this._middleware = null;
        this.parent = null;
        this._metadataReader = new MetadataReader();
    }

    public load(...modules: interfaces.ContainerModule[]) {

        const getHelpers = this._getContainerModuleHelpersFactory();

        for (const currentModule of modules) {

            const containerModuleHelpers = getHelpers(currentModule.id);

            currentModule.registry(
                containerModuleHelpers.bindFunction,
                containerModuleHelpers.unbindFunction,
                containerModuleHelpers.isboundFunction,
                containerModuleHelpers.rebindFunction
            );

        }

    }

    public async loadAsync(...modules: interfaces.AsyncContainerModule[]) {

        const getHelpers = this._getContainerModuleHelpersFactory();

        for (const currentModule of modules) {

            const containerModuleHelpers = getHelpers(currentModule.id);

            await currentModule.registry(
                containerModuleHelpers.bindFunction,
                containerModuleHelpers.unbindFunction,
                containerModuleHelpers.isboundFunction,
                containerModuleHelpers.rebindFunction
            );

        }

    }

    public unload(...modules: interfaces.ContainerModule[]): void {

        const conditionFactory = (expected: any) => (item: interfaces.Binding<any>): boolean =>
            item.moduleId === expected;

        modules.forEach((module) => {
            const condition = conditionFactory(module.id);
            this._bindingDictionary.removeByCondition(condition);
        });

    }

    // Registers a type binding
    public bind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
        const scope = this.options.defaultScope || BindingScopeEnum.Transient;
        const binding = new Binding<T>(serviceIdentifier, scope, this._snapshotSingletonCloneDeep);
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
        let bound = this._bindingDictionary.hasKey(serviceIdentifier);
        if (!bound && this.parent) {
            bound = this.parent.isBound(serviceIdentifier);
        }
        return bound;
    }

    public isBoundNamed(serviceIdentifier: interfaces.ServiceIdentifier<any>, named: string | number | symbol): boolean {
        return this.isBoundTagged(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    // Check if a binding with a complex constraint is available without throwing a error. Ancestors are also verified.
    public isBoundTagged(serviceIdentifier: interfaces.ServiceIdentifier<any>, key: string | number | symbol, value: any): boolean {
        let bound = false;

        // verify if there are bindings available for serviceIdentifier on current binding dictionary
        if (this._bindingDictionary.hasKey(serviceIdentifier)) {
            const bindings = this._bindingDictionary.get(serviceIdentifier);
            const request = createMockRequest(this, serviceIdentifier, key, value);
            bound = bindings.some((b) => b.constraint(request));
        }

        // verify if there is a parent container that could solve the request
        if (!bound && this.parent) {
            bound = this.parent.isBoundTagged(serviceIdentifier, key, value);
        }

        return bound;
    }

    public snapshot(): void {
        this._snapshots.push(ContainerSnapshot.of(this._bindingDictionary.clone(), this._middleware));
    }

    public restore(): void {
        const snapshot = this._snapshots.pop();
        if (snapshot === undefined) {
            throw new Error(ERROR_MSGS.NO_MORE_SNAPSHOTS_AVAILABLE);
        }
        this._bindingDictionary = snapshot.bindings;
        this._middleware = snapshot.middleware;
    }

    public createChild(containerOptions?: interfaces.ContainerOptions): Container {
        const child = new Container(containerOptions || this.options);
        child.parent = this;
        return child;
    }

    public applyMiddleware(...middlewares: interfaces.Middleware[]): void {
        const initial: interfaces.Next = (this._middleware) ? this._middleware : this._planAndResolve();
        this._middleware = middlewares.reduce(
            (prev, curr) => curr(prev),
            initial);
    }

    public applyCustomMetadataReader(metadataReader: interfaces.MetadataReader) {
        this._metadataReader = metadataReader;
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier must be associated with only one binding
    // use getAll when the runtime identifier is associated with multiple bindings
    public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
        return this._get<T>(false, false, TargetTypeEnum.Variable, serviceIdentifier) as T;
    }

    public getTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string | number | symbol, value: any): T {
        return this._get<T>(false, false, TargetTypeEnum.Variable, serviceIdentifier, key, value) as T;
    }

    public getNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string | number | symbol): T {
        return this.getTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier can be associated with one or multiple bindings
    public getAll<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[] {
        return this._get<T>(true, true, TargetTypeEnum.Variable, serviceIdentifier) as T[];
    }

    public getAllTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string | number | symbol, value: any): T[] {
        return this._get<T>(false, true, TargetTypeEnum.Variable, serviceIdentifier, key, value) as T[];
    }

    public getAllNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string | number | symbol): T[] {
        return this.getAllTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    public resolve<T>(constructorFunction: interfaces.Newable<T>) {
        const tempContainer = this.createChild();
        tempContainer.bind<T>(constructorFunction).toSelf();
        return tempContainer.get<T>(constructorFunction);
    }

    private _getContainerModuleHelpersFactory() {

        const setModuleId = (bindingToSyntax: any, moduleId: number) => {
            bindingToSyntax._binding.moduleId = moduleId;
        };

        const getBindFunction = (moduleId: number) =>
            (serviceIdentifier: interfaces.ServiceIdentifier<any>) => {
                const _bind = this.bind.bind(this);
                const bindingToSyntax = _bind(serviceIdentifier);
                setModuleId(bindingToSyntax, moduleId);
                return bindingToSyntax;
            };

        const getUnbindFunction = (moduleId: number) =>
            (serviceIdentifier: interfaces.ServiceIdentifier<any>) => {
                const _unbind = this.unbind.bind(this);
                _unbind(serviceIdentifier);
            };

        const getIsboundFunction = (moduleId: number) =>
            (serviceIdentifier: interfaces.ServiceIdentifier<any>) => {
                const _isBound = this.isBound.bind(this);
                return _isBound(serviceIdentifier);
            };

        const getRebindFunction = (moduleId: number) =>
            (serviceIdentifier: interfaces.ServiceIdentifier<any>) => {
                const _rebind = this.rebind.bind(this);
                const bindingToSyntax = _rebind(serviceIdentifier);
                setModuleId(bindingToSyntax, moduleId);
                return bindingToSyntax;
            };

        return (mId: number) => ({
            bindFunction: getBindFunction(mId),
            isboundFunction: getIsboundFunction(mId),
            rebindFunction: getRebindFunction(mId),
            unbindFunction: getUnbindFunction(mId)
        });

    }

    // Prepares arguments required for resolution and
    // delegates resolution to _middleware if available
    // otherwise it delegates resolution to _planAndResolve
    private _get<T>(
        avoidConstraints: boolean,
        isMultiInject: boolean,
        targetType: interfaces.TargetType,
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        key?: string | number | symbol,
        value?: any
    ): (T | T[]) {

        let result: (T | T[]) | null = null;

        const defaultArgs: interfaces.NextArgs = {
            avoidConstraints,
            contextInterceptor: (context: interfaces.Context) => context,
            isMultiInject,
            key,
            serviceIdentifier,
            targetType,
            value
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
    private _planAndResolve<T>(): (args: interfaces.NextArgs) => (T | T[]) {
        return (args: interfaces.NextArgs) => {

            // create a plan
            let context = plan(
                this._metadataReader,
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
            const result = resolve<T>(context);
            return result;

        };
    }

}

export { Container };
