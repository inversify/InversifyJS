import { Binding } from "../bindings/binding";
import * as ERROR_MSGS from "../constants/error_msgs";
import { BindingScopeEnum, TargetTypeEnum } from "../constants/literal_types";
import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";
import { MetadataReader } from "../planning/metadata_reader";
import { createMockRequest, getBindingDictionary, plan } from "../planning/planner";
import { Lazy } from "../resolution/lazy";
import { resolve } from "../resolution/resolver";
import { BindingToSyntax } from "../syntax/binding_to_syntax";
import { id } from "../utils/id";
import { getServiceIdentifierAsString } from "../utils/serialization";
import { ContainerSnapshot } from "./container_snapshot";
import { Lookup } from "./lookup";
import BindingDeactivation = interfaces.BindingDeactivation;

class Container implements interfaces.Container {

    public id: number;
    public parent: interfaces.Container | null;
    public readonly options: interfaces.ContainerOptions;
    private _middleware: interfaces.Next | null;
    private _bindingDictionary: interfaces.Lookup<interfaces.Binding<any>>;
    private _activations: interfaces.Lookup<interfaces.BindingActivation<any>>;
    private _deactivations: interfaces.Lookup<interfaces.BindingDeactivation<any>>;
    private _snapshots: interfaces.ContainerSnapshot[];
    private _metadataReader: interfaces.MetadataReader;

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
        this._activations = new Lookup<interfaces.BindingActivation<any>>();
        this._deactivations = new Lookup<interfaces.BindingDeactivation<any>>();
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
                containerModuleHelpers.rebindFunction,
                containerModuleHelpers.onActivationFunction,
                containerModuleHelpers.onDeactivationFunction
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
                containerModuleHelpers.rebindFunction,
                containerModuleHelpers.onActivationFunction,
                containerModuleHelpers.onDeactivationFunction
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
        const binding = new Binding<T>(serviceIdentifier, scope);
        this._bindingDictionary.add(serviceIdentifier, binding);
        return new BindingToSyntax<T>(binding);
    }

    public rebind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
        this.unbind(serviceIdentifier);
        return this.bind(serviceIdentifier);
    }

    // Removes a type binding from the registry by its key
    public unbind(serviceIdentifier: interfaces.ServiceIdentifier<any>): void {
        if (this._bindingDictionary.hasKey(serviceIdentifier)) {
            const bindings = this._bindingDictionary.get(serviceIdentifier);

            for (const binding of bindings) {
                const result = this.preDestroy(binding);

                if (result instanceof Promise) {
                    throw new Error(ERROR_MSGS.ASYNC_UNBIND_REQUIRED);
                }
            }
        }

        try {
            this._bindingDictionary.remove(serviceIdentifier);
        } catch (e) {
            throw new Error(`${ERROR_MSGS.CANNOT_UNBIND} ${getServiceIdentifierAsString(serviceIdentifier)}`);
        }
    }

    public async unbindAsync(serviceIdentifier: interfaces.ServiceIdentifier<any>): Promise<void> {
        if (this._bindingDictionary.hasKey(serviceIdentifier)) {
            const bindings = this._bindingDictionary.get(serviceIdentifier);

            for (const binding of bindings) {
                await this.preDestroy(binding);
            }
        }

        try {
            this._bindingDictionary.remove(serviceIdentifier);
        } catch (e) {
            throw new Error(`${ERROR_MSGS.CANNOT_UNBIND} ${getServiceIdentifierAsString(serviceIdentifier)}`);
        }
    }

    // Removes all the type bindings from the registry
    public unbindAll(): void {
        this._bindingDictionary.traverse((key, value) => {
            for (const binding of value) {
                const result = this.preDestroy(binding);

                if (result instanceof Promise) {
                    throw new Error(ERROR_MSGS.ASYNC_UNBIND_REQUIRED);
                }
            }
        });

        this._bindingDictionary = new Lookup<Binding<any>>();
    }

    public async unbindAllAsync(): Promise<void> {
        const promises: Promise<any>[] = [];

        this._bindingDictionary.traverse((key, value) => {
            for (const binding of value) {
                const result = this.preDestroy(binding);

                if (result instanceof Promise) {
                    promises.push(result);
                }
            }
        });

        await Promise.all(promises);

        this._bindingDictionary = new Lookup<Binding<any>>();
    }

    public onActivation<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, onActivation: interfaces.BindingActivation<T>) {
        this._activations.add(serviceIdentifier, onActivation);
    }

    public onDeactivation<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, onDeactivation: interfaces.BindingDeactivation<T>) {
        this._deactivations.add(serviceIdentifier, onDeactivation);
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
        this._snapshots.push(ContainerSnapshot.of(
          this._bindingDictionary.clone(),
          this._middleware,
          this._activations.clone(),
          this._deactivations.clone()
        ));
    }

    public restore(): void {
        const snapshot = this._snapshots.pop();
        if (snapshot === undefined) {
            throw new Error(ERROR_MSGS.NO_MORE_SNAPSHOTS_AVAILABLE);
        }
        this._bindingDictionary = snapshot.bindings;
        this._activations = snapshot.activations;
        this._deactivations = snapshot.deactivations;
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
        return this._get<T>(false, false, TargetTypeEnum.Variable, serviceIdentifier, false) as T;
    }

    public getAsync<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): Promise<T> {
        const result = this._get<T>(false, false, TargetTypeEnum.Variable, serviceIdentifier, true) as T;

        return this.resultToAsync(result);
    }

    public getTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string | number | symbol, value: any): T {
        return this._get<T>(false, false, TargetTypeEnum.Variable, serviceIdentifier, false, key, value) as T;
    }

    public getTaggedAsync<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string | number | symbol, value: any): Promise<T> {
        const result = this._get<T>(false, false, TargetTypeEnum.Variable, serviceIdentifier, true, key, value) as T;

        return this.resultToAsync(result);
    }

    public getNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string | number | symbol): T {
        return this.getTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    public getNamedAsync<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string | number | symbol): Promise<T> {
        return this.getTaggedAsync<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier can be associated with one or multiple bindings
    public getAll<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[] {
        return this._get<T>(true, true, TargetTypeEnum.Variable, serviceIdentifier, false) as T[];
    }

    public getAllAsync<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): Promise<T>[] {
        const results = this._get<T>(true, true, TargetTypeEnum.Variable, serviceIdentifier, true) as T[];

        return results.map(this.resultToAsync);
    }

    public getAllTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string | number | symbol, value: any): T[] {
        return this._get<T>(false, true, TargetTypeEnum.Variable, serviceIdentifier, false, key, value) as T[];
    }

    public getAllTaggedAsync<T>(
      serviceIdentifier: interfaces.ServiceIdentifier<T>,
      key: string | number | symbol,
      value: any
    ): Promise<T>[] {
        const results = this._get<T>(false, true, TargetTypeEnum.Variable, serviceIdentifier, true, key, value) as T[];

        return results.map(this.resultToAsync);
    }

    public getAllNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string | number | symbol): T[] {
        return this.getAllTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    public getAllNamedAsync<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string | number | symbol): Promise<T>[] {
      return this.getAllTaggedAsync<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    public resolve<T>(constructorFunction: interfaces.Newable<T>) {
        const tempContainer = this.createChild();
        tempContainer.bind<T>(constructorFunction).toSelf();
        return tempContainer.get<T>(constructorFunction);
    }

    private preDestroy(binding: Binding<any>): Promise<void> | void {
        if (!binding.cache) {
            return;
        }

        if (binding.cache instanceof Lazy) {
            return binding.cache.resolve().then(async (resolved) => this.doDeactivation(binding, resolved));
        }

        return this.doDeactivation(binding, binding.cache);
    }

    private doDeactivation<T>(
      binding: Binding<T>,
      instance: T,
      iter?: IterableIterator<[number, BindingDeactivation<any>]>
    ): void | Promise<void> {
        let constr: any;

        try {
            constr = (instance as any).constructor;
        } catch (ex) {
            // if placing mocks in container (eg: TypeMoq), this could blow up as constructor is not stubbed
            return;
        }

        try {
            if (this._deactivations.hasKey(binding.serviceIdentifier)) {
                const deactivations = iter || this._deactivations.get(binding.serviceIdentifier).entries();

                let deact = deactivations.next();

                while (deact.value) {
                    const result = deact.value[1](instance);

                    if (result instanceof Promise) {
                        return result.then(() => {
                            this.doDeactivation(binding, instance, deactivations);
                        }).catch((ex) => {
                            throw new Error(ERROR_MSGS.ON_DEACTIVATION_ERROR(constr.name, ex.message));
                        });
                    }

                    deact = deactivations.next();
                }
            }
        } catch (ex) {
            throw new Error(ERROR_MSGS.ON_DEACTIVATION_ERROR(constr.name, ex.message));
        }

        if (this.parent) {
            return this.doDeactivation.bind(this.parent)(binding, instance);
        }

        try {
            if (typeof binding.onDeactivation === "function") {
                const result = binding.onDeactivation(instance);

                if (result instanceof Promise) {
                    return result.then(() => this.destroyMetadata(constr, instance));
                }
            }

            return this.destroyMetadata(constr, instance);
        } catch (ex) {
            throw new Error(ERROR_MSGS.ON_DEACTIVATION_ERROR(constr.name, ex.message));
        }
    }

    private destroyMetadata(constr: any, instance: any) {
        if (Reflect.hasMetadata(METADATA_KEY.PRE_DESTROY, constr)) {
            const data: Metadata = Reflect.getMetadata(METADATA_KEY.PRE_DESTROY, constr);
            try {
                return instance[data.value]();
            } catch (e) {
                throw new Error(ERROR_MSGS.PRE_DESTROY_ERROR(constr.name, e.message));
            }
        }
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
            onActivationFunction: this.onActivation.bind(this),
            onDeactivationFunction: this.onDeactivation.bind(this),
            rebindFunction: getRebindFunction(mId),
            unbindFunction: getUnbindFunction(mId)
        });

    }

    private resultToAsync<T>(result: T): Promise<T> {
        if (result instanceof Lazy) {
            return result.resolve();
        }

        return Promise.resolve<T>(result);
    }

    // Prepares arguments required for resolution and
    // delegates resolution to _middleware if available
    // otherwise it delegates resolution to _planAndResolve
    private _get<T>(
        avoidConstraints: boolean,
        isMultiInject: boolean,
        targetType: interfaces.TargetType,
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        lazy: boolean = false,
        key?: string | number | symbol,
        value?: any
    ): (T | T[] | Lazy<T> | Lazy<T>[]) {

        let result: (T | T[] | Lazy<T> | Lazy<T>[]) | null = null;

        const defaultArgs: interfaces.NextArgs = {
            avoidConstraints,
            contextInterceptor: (context: interfaces.Context) => context,
            isMultiInject,
            key,
            lazy,
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

            if (result instanceof Lazy && !args.lazy) {
              throw new Error(ERROR_MSGS.LAZY_IN_SYNC(args.serviceIdentifier));
            }

            return result;

        };
    }
}

export { Container };
