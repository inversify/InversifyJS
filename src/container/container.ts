import { Binding } from '../bindings/binding';
import * as ERROR_MSGS from '../constants/error_msgs';
import { BindingScopeEnum, TargetTypeEnum } from '../constants/literal_types';
import * as METADATA_KEY from '../constants/metadata_keys';
import { interfaces } from '../interfaces/interfaces';
import { MetadataReader } from '../planning/metadata_reader';
import { createMockRequest, getBindingDictionary, plan } from '../planning/planner';
import { resolve } from '../resolution/resolver';
import { BindingToSyntax } from '../syntax/binding_to_syntax';
import { isPromise, isPromiseOrContainsPromise } from '../utils/async';
import { id } from '../utils/id';
import { getServiceIdentifierAsString } from '../utils/serialization';
import { ContainerSnapshot } from './container_snapshot';
import { Lookup } from './lookup';
import { ModuleActivationStore } from './module_activation_store';

type GetArgs<T> = Omit<interfaces.NextArgs<T>, 'contextInterceptor' | 'targetType'>

class Container<T extends interfaces.BindingMap = any, P extends interfaces.BindingMap = any> implements interfaces.Container<T, P> {

  public id: number;
  public parent: interfaces.Container<P> | null;
  public readonly options: interfaces.ContainerOptions;
  private _middleware: interfaces.Next | null;
  private _bindingDictionary: interfaces.Lookup<interfaces.Binding<unknown>>;
  private _activations: interfaces.Lookup<interfaces.BindingActivation<unknown>>;
  private _deactivations: interfaces.Lookup<interfaces.BindingDeactivation<unknown>>;
  private _snapshots: interfaces.ContainerSnapshot[];
  private _metadataReader: interfaces.MetadataReader;
  private _moduleActivationStore: interfaces.ModuleActivationStore

  public static merge(
    container1: interfaces.Container,
    container2: interfaces.Container,
    ...containers: interfaces.Container[]
  ): interfaces.Container {
    const container = new Container();
    const targetContainers: interfaces.Lookup<interfaces.Binding<unknown>>[] = [container1, container2, ...containers]
      .map((targetContainer) => getBindingDictionary(targetContainer));
    const bindingDictionary: interfaces.Lookup<interfaces.Binding<unknown>> = getBindingDictionary(container);

    function copyDictionary(
      origin: interfaces.Lookup<interfaces.Binding<unknown>>,
      destination: interfaces.Lookup<interfaces.Binding<unknown>>
    ) {

      origin.traverse((_key, value) => {
        value.forEach((binding) => {
          destination.add(binding.serviceIdentifier, binding.clone());
        });
      });

    }

    targetContainers.forEach((targetBindingDictionary) => {
      copyDictionary(targetBindingDictionary, bindingDictionary);
    });

    return container;
  }

  public constructor(containerOptions?: interfaces.ContainerOptions) {
    const options = containerOptions || {};
    if (typeof options !== 'object') {
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
      typeof options.autoBindInjectable !== 'boolean'
    ) {
      throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_AUTO_BIND_INJECTABLE}`);
    }

    if (options.skipBaseClassChecks === undefined) {
      options.skipBaseClassChecks = false;
    } else if (
      typeof options.skipBaseClassChecks !== 'boolean'
    ) {
      throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_SKIP_BASE_CHECK}`);
    }

    this.options = {
      autoBindInjectable: options.autoBindInjectable,
      defaultScope: options.defaultScope,
      skipBaseClassChecks: options.skipBaseClassChecks
    };

    this.id = id();
    this._bindingDictionary = new Lookup<interfaces.Binding<unknown>>();
    this._snapshots = [];
    this._middleware = null;
    this._activations = new Lookup<interfaces.BindingActivation<unknown>>();
    this._deactivations = new Lookup<interfaces.BindingDeactivation<unknown>>();
    this.parent = null;
    this._metadataReader = new MetadataReader();
    this._moduleActivationStore = new ModuleActivationStore()
  }

  public load(...modules: interfaces.ContainerModule[]) {

    const getHelpers = this._getContainerModuleHelpersFactory();

    for (const currentModule of modules) {

      const containerModuleHelpers = getHelpers(currentModule.id);

      currentModule.registry(
        containerModuleHelpers.bindFunction as interfaces.Bind,
        containerModuleHelpers.unbindFunction as interfaces.Unbind,
        containerModuleHelpers.isboundFunction as interfaces.IsBound,
        containerModuleHelpers.rebindFunction as interfaces.Rebind,
        containerModuleHelpers.unbindAsyncFunction as interfaces.UnbindAsync,
        containerModuleHelpers.onActivationFunction as interfaces.Container['onActivation'],
        containerModuleHelpers.onDeactivationFunction as interfaces.Container['onDeactivation']
      );

    }

  }

  public async loadAsync(...modules: interfaces.AsyncContainerModule[]) {

    const getHelpers = this._getContainerModuleHelpersFactory();

    for (const currentModule of modules) {

      const containerModuleHelpers = getHelpers(currentModule.id);

      await currentModule.registry(
        containerModuleHelpers.bindFunction as interfaces.Bind,
        containerModuleHelpers.unbindFunction as interfaces.Unbind,
        containerModuleHelpers.isboundFunction as interfaces.IsBound,
        containerModuleHelpers.rebindFunction as interfaces.Rebind,
        containerModuleHelpers.unbindAsyncFunction as interfaces.UnbindAsync,
        containerModuleHelpers.onActivationFunction as interfaces.Container['onActivation'],
        containerModuleHelpers.onDeactivationFunction as interfaces.Container['onDeactivation']
      );

    }

  }

  public unload(...modules: interfaces.ContainerModuleBase[]): void {
    modules.forEach((module) => {
      const deactivations = this._removeModuleBindings(module.id)
      this._deactivateSingletons(deactivations);

      this._removeModuleHandlers(module.id);
    });

  }

  public async unloadAsync(...modules: interfaces.ContainerModuleBase[]): Promise<void> {
    for (const module of modules) {
      const deactivations = this._removeModuleBindings(module.id)
      await this._deactivateSingletonsAsync(deactivations)

      this._removeModuleHandlers(module.id);
    }

  }

  // Registers a type binding
  public bind<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
  ): interfaces.BindingToSyntax<B> {
    const scope = this.options.defaultScope || BindingScopeEnum.Transient;
    const binding = new Binding<B>(serviceIdentifier as interfaces.ServiceIdentifier<B>, scope);
    this._bindingDictionary.add(serviceIdentifier, binding as Binding<unknown>);
    return new BindingToSyntax<B>(binding);
  }

  public rebind<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
  ): interfaces.BindingToSyntax<B> {
    this.unbind(serviceIdentifier);
    return this.bind(serviceIdentifier);
  }

  public async rebindAsync<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
  ): Promise<interfaces.BindingToSyntax<B>> {
    await this.unbindAsync(serviceIdentifier);
    return this.bind(serviceIdentifier);
  }

  // Removes a type binding from the registry by its key
  public unbind<K extends interfaces.ContainerIdentifier<T>>(serviceIdentifier: K): void {
    if (this._bindingDictionary.hasKey(serviceIdentifier)) {
      const bindings = this._bindingDictionary.get(serviceIdentifier);

      this._deactivateSingletons(bindings);
    }

    this._removeServiceFromDictionary(serviceIdentifier);
  }

  public async unbindAsync<K extends interfaces.ContainerIdentifier<T>>(serviceIdentifier: K): Promise<void> {
    if (this._bindingDictionary.hasKey(serviceIdentifier)) {
      const bindings = this._bindingDictionary.get(serviceIdentifier);

      await this._deactivateSingletonsAsync(bindings);
    }

    this._removeServiceFromDictionary(serviceIdentifier);
  }

  // Removes all the type bindings from the registry
  public unbindAll(): void {
    this._bindingDictionary.traverse((_key, value) => {
      this._deactivateSingletons(value);
    });

    this._bindingDictionary = new Lookup<Binding<unknown>>();
  }

  public async unbindAllAsync(): Promise<void> {
    const promises: Promise<void>[] = [];

    this._bindingDictionary.traverse((_key, value) => {
      promises.push(this._deactivateSingletonsAsync(value));
    });

    await Promise.all(promises);

    this._bindingDictionary = new Lookup<Binding<unknown>>();
  }

  public onActivation<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
    onActivation: interfaces.BindingActivation<B>,
  ): void {
    this._activations.add(serviceIdentifier, onActivation as interfaces.BindingActivation<unknown>);
  }

  public onDeactivation<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
    onDeactivation: interfaces.BindingDeactivation<B>,
  ): void {
    this._deactivations.add(serviceIdentifier, onDeactivation as interfaces.BindingDeactivation<unknown>);
  }

  // Allows to check if there are bindings available for serviceIdentifier
  public isBound<K extends interfaces.ContainerIdentifier<T>>(serviceIdentifier: K): boolean {
    let bound = this._bindingDictionary.hasKey(serviceIdentifier);
    if (!bound && this.parent) {
      bound = this.parent.isBound(serviceIdentifier as any);
    }
    return bound;
  }

  // check binding dependency only in current container
  public isCurrentBound<K extends interfaces.ContainerIdentifier<T>>(serviceIdentifier: K): boolean {
    return this._bindingDictionary.hasKey(serviceIdentifier);
  }

  public isBoundNamed<K extends interfaces.ContainerIdentifier<T>>(
    serviceIdentifier: K,
    named: string | number | symbol,
): boolean {
    return this.isBoundTagged(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
  }

  // Check if a binding with a complex constraint is available without throwing a error. Ancestors are also verified.
  public isBoundTagged<K extends interfaces.ContainerIdentifier<T>>(
    serviceIdentifier: K,
    key: string | number | symbol,
    value: unknown,
  ): boolean {
    let bound = false;

    // verify if there are bindings available for serviceIdentifier on current binding dictionary
    if (this._bindingDictionary.hasKey(serviceIdentifier)) {
      const bindings = this._bindingDictionary.get(serviceIdentifier);
      const request = createMockRequest(this, serviceIdentifier, key, value);
      bound = bindings.some((b) => b.constraint(request));
    }

    // verify if there is a parent container that could solve the request
    if (!bound && this.parent) {
      bound = this.parent.isBoundTagged(serviceIdentifier as any, key, value);
    }

    return bound;
  }

  public snapshot(): void {
    this._snapshots.push(ContainerSnapshot.of(
      this._bindingDictionary.clone(),
      this._middleware,
      this._activations.clone(),
      this._deactivations.clone(),
      this._moduleActivationStore.clone()
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
    this._moduleActivationStore = snapshot.moduleActivationStore
  }

  public createChild<C extends interfaces.BindingMap = any>(containerOptions?: interfaces.ContainerOptions): Container<C, T> {
    const child = new Container<C, T>(containerOptions || this.options);
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
  public get<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(serviceIdentifier: K): B {
    const getArgs = this._getNotAllArgs(serviceIdentifier, false);

    return this._getButThrowIfAsync(getArgs) as B;
  }

  public async getAsync<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
  ): Promise<B> {
    const getArgs = this._getNotAllArgs(serviceIdentifier, false);

    return this._get(getArgs) as Promise<B> | B;
  }

  public getTagged<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
    key: string | number | symbol,
    value: unknown,
  ): B {
    const getArgs = this._getNotAllArgs(serviceIdentifier, false, key, value);

    return this._getButThrowIfAsync(getArgs) as B;
  }

  public async getTaggedAsync<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
    key: string | number | symbol,
    value: unknown,
  ): Promise<B> {
    const getArgs = this._getNotAllArgs(serviceIdentifier, false, key, value);

    return this._get(getArgs) as Promise<B> | B;
  }

  public getNamed<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
    named: string | number | symbol,
  ): B {
    return this.getTagged(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
  }

  public getNamedAsync<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
    named: string | number | symbol,
  ): Promise<B> {
    return this.getTaggedAsync(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
  }

  // Resolves a dependency by its runtime identifier
  // The runtime identifier can be associated with one or multiple bindings
  public getAll<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
  ): B[] {
    const getArgs = this._getAllArgs(serviceIdentifier);

    return this._getButThrowIfAsync(getArgs) as B[];
  }

  public getAllAsync<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
  ): Promise<B[]> {
    const getArgs = this._getAllArgs(serviceIdentifier);

    return this._getAll(getArgs) as Promise<B[]>;
  }

  public getAllTagged<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
    key: string | number | symbol,
    value: unknown,
  ): B[] {
    const getArgs = this._getNotAllArgs(serviceIdentifier, true, key, value);

    return this._getButThrowIfAsync(getArgs) as B[];
  }

  public getAllTaggedAsync<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
    key: string | number | symbol,
    value: unknown,
  ): Promise<B[]> {
    const getArgs = this._getNotAllArgs(serviceIdentifier, true, key, value);

    return this._getAll(getArgs) as Promise<B[]>;
  }

  public getAllNamed<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
    named: string | number | symbol,
  ): B[] {
    return this.getAllTagged(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
  }

  public getAllNamedAsync<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
    named: string | number | symbol,
  ): Promise<B[]> {
    return this.getAllTaggedAsync(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
  }

  public resolve<B>(constructorFunction: interfaces.Newable<B>): B {
    const isBound = this.isBound(constructorFunction as any);
    if (!isBound) {
      this.bind(constructorFunction as any).toSelf();
    }
    const resolved = this.get(constructorFunction as any) as B;
    if (!isBound) {
      this.unbind(constructorFunction as any);
    }
    return resolved;
  }

  private _preDestroy<B>(constructor: NewableFunction, instance: B): Promise<void> | void {
    if (Reflect.hasMetadata(METADATA_KEY.PRE_DESTROY, constructor)) {
      const data: interfaces.Metadata = Reflect.getMetadata(METADATA_KEY.PRE_DESTROY, constructor);
      return (instance as interfaces.Instance<B>)[(data.value as string)]?.();
    }
  }
  private _removeModuleHandlers(moduleId: number): void {
    const moduleActivationsHandlers = this._moduleActivationStore.remove(moduleId);

    this._activations.removeIntersection(moduleActivationsHandlers.onActivations);
    this._deactivations.removeIntersection(moduleActivationsHandlers.onDeactivations);
  }

  private _removeModuleBindings(moduleId: number): interfaces.Binding<unknown>[] {
    return this._bindingDictionary.removeByCondition(binding => binding.moduleId === moduleId);
  }

  private _deactivate<B>(binding: Binding<B>, instance: B): void | Promise<void> {
    const constructor: NewableFunction = Object.getPrototypeOf(instance).constructor;

    try {
      if (this._deactivations.hasKey(binding.serviceIdentifier)) {
        const result = this._deactivateContainer(
          instance,
          this._deactivations.get(binding.serviceIdentifier).values(),
        );

        if (isPromise(result)) {
          return this._handleDeactivationError(
            result.then(() => this._propagateContainerDeactivationThenBindingAndPreDestroyAsync(
              binding, instance, constructor)),
            constructor
          );
        }
      }

      const propagateDeactivationResult = this._propagateContainerDeactivationThenBindingAndPreDestroy(
        binding, instance, constructor);

      if (isPromise(propagateDeactivationResult)) {
        return this._handleDeactivationError(propagateDeactivationResult, constructor);
      }
    } catch (ex) {
      if (ex instanceof Error) {
        throw new Error(ERROR_MSGS.ON_DEACTIVATION_ERROR(constructor.name, ex.message));
      }
    }
  }

  private async _handleDeactivationError(asyncResult: Promise<void>, constructor: NewableFunction): Promise<void> {
    try {
      await asyncResult;
    } catch (ex) {
      if (ex instanceof Error) {
        throw new Error(ERROR_MSGS.ON_DEACTIVATION_ERROR(constructor.name, ex.message));
      }
    }
  }


  private _deactivateContainer<B>(
    instance: B,
    deactivationsIterator: IterableIterator<interfaces.BindingDeactivation<unknown>>,
  ): void | Promise<void> {
    let deactivation = deactivationsIterator.next();

    while (deactivation.value) {
      const result = deactivation.value(instance);

      if (isPromise(result)) {
        return result.then(() =>
          this._deactivateContainerAsync(instance, deactivationsIterator),
        );
      }

      deactivation = deactivationsIterator.next();
    }
  }

  private async _deactivateContainerAsync<B>(
    instance: B,
    deactivationsIterator: IterableIterator<interfaces.BindingDeactivation<unknown>>,
  ): Promise<void> {
    let deactivation = deactivationsIterator.next();

    while (deactivation.value) {
      await deactivation.value(instance);
      deactivation = deactivationsIterator.next();
    }
  }

  private _getContainerModuleHelpersFactory() {

    const setModuleId = (bindingToSyntax: interfaces.BindingToSyntax<unknown>, moduleId: interfaces.ContainerModuleBase['id']) => {
      // TODO: Implement an internal type `_BindingToSyntax<T>` wherein this member
      // can be public. Let `BindingToSyntax<T>` be the presentational type that
      // depends on it, and does not expose this member as public.
      (bindingToSyntax as unknown as { _binding: { moduleId: interfaces.ContainerModuleBase['id'] } } )._binding.moduleId = moduleId;
    };

    const getBindFunction = <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      moduleId: interfaces.ContainerModuleBase['id'],
    ) =>
      (serviceIdentifier: K) => {
        const bindingToSyntax = this.bind(serviceIdentifier);
        setModuleId(bindingToSyntax, moduleId);
        return bindingToSyntax as BindingToSyntax<B>;
      };

    const getUnbindFunction = <K extends interfaces.ContainerIdentifier<T>>() =>
      (serviceIdentifier: K) => {
        return this.unbind(serviceIdentifier);
      };

    const getUnbindAsyncFunction = <K extends interfaces.ContainerIdentifier<T>>() =>
      (serviceIdentifier: K) => {
        return this.unbindAsync(serviceIdentifier);
      };

    const getIsboundFunction = <K extends interfaces.ContainerIdentifier<T>>() =>
      (serviceIdentifier: K) => {
        return this.isBound(serviceIdentifier)
      };

    const getRebindFunction = <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      moduleId: interfaces.ContainerModuleBase['id'],
    ) =>
      (serviceIdentifier: K) => {
        const bindingToSyntax = this.rebind(serviceIdentifier);
        setModuleId(bindingToSyntax, moduleId);
        return bindingToSyntax as BindingToSyntax<B>;
      };

    const getOnActivationFunction = <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      moduleId: interfaces.ContainerModuleBase['id'],
    ) =>
      (serviceIdentifier: K, onActivation: interfaces.BindingActivation<B>) => {
        this._moduleActivationStore.addActivation(moduleId, serviceIdentifier, onActivation as interfaces.BindingActivation<unknown>);
        this.onActivation(serviceIdentifier, onActivation);
      }

    const getOnDeactivationFunction = <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      moduleId: interfaces.ContainerModuleBase['id'],
    ) =>
      (serviceIdentifier: K, onDeactivation: interfaces.BindingDeactivation<B>) => {
        this._moduleActivationStore.addDeactivation(moduleId, serviceIdentifier, onDeactivation as interfaces.BindingDeactivation<unknown>);
        this.onDeactivation(serviceIdentifier, onDeactivation);
      }

    return (mId: interfaces.ContainerModuleBase['id']) => ({
      bindFunction: getBindFunction(mId),
      isboundFunction: getIsboundFunction(),
      onActivationFunction: getOnActivationFunction(mId),
      onDeactivationFunction: getOnDeactivationFunction(mId),
      rebindFunction: getRebindFunction(mId),
      unbindFunction: getUnbindFunction(),
      unbindAsyncFunction: getUnbindAsyncFunction()
    });

  }
  private _getAll<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    getArgs: GetArgs<B>,
  ): Promise<B[]> {
    return Promise.all(this._get<B>(getArgs) as (Promise<B> | B)[]);
  }
  // Prepares arguments required for resolution and
  // delegates resolution to _middleware if available
  // otherwise it delegates resolution to _planAndResolve
  private _get<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    getArgs: GetArgs<B>,
  ): interfaces.ContainerResolution<B> {
    const planAndResolveArgs: interfaces.NextArgs<B> = {
      ...getArgs,
      contextInterceptor: (context) => context,
      targetType: TargetTypeEnum.Variable
    }
    if (this._middleware) {
      const middlewareResult = this._middleware(planAndResolveArgs);
      if (middlewareResult === undefined || middlewareResult === null) {
        throw new Error(ERROR_MSGS.INVALID_MIDDLEWARE_RETURN);
      }
      return middlewareResult as interfaces.ContainerResolution<B>;
    }

    return this._planAndResolve<B>()(planAndResolveArgs);
  }

  private _getButThrowIfAsync<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    getArgs: GetArgs<B>,
  ): (B | B[]) {
    const result = this._get<B>(getArgs);

    if (isPromiseOrContainsPromise<B>(result)) {
      throw new Error(ERROR_MSGS.LAZY_IN_SYNC(getArgs.serviceIdentifier));
    }

    return result as (B | B[]);
  }

  private _getAllArgs<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
  ): GetArgs<B> {
    const getAllArgs: GetArgs<B> = {
      avoidConstraints: true,
      isMultiInject: true,
      serviceIdentifier: serviceIdentifier as interfaces.ServiceIdentifier<B>,
    };

    return getAllArgs;
  }

  private _getNotAllArgs<B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
    serviceIdentifier: K,
    isMultiInject: boolean,
    key?: string | number | symbol | undefined,
    value?: unknown,
  ): GetArgs<B> {
    const getNotAllArgs: GetArgs<B> = {
      avoidConstraints: false,
      isMultiInject,
      serviceIdentifier: serviceIdentifier as interfaces.ServiceIdentifier<B>,
      key,
      value,
    };

    return getNotAllArgs;
  }

  // Planner creates a plan and Resolver resolves a plan
  // one of the jobs of the Container is to links the Planner
  // with the Resolver and that is what this function is about
  private _planAndResolve<B = unknown>(): (args: interfaces.NextArgs<B>) => interfaces.ContainerResolution<B> {
    return (args: interfaces.NextArgs<B>) => {

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
      const result = resolve<B>(context);

      return result;

    };
  }

  private _deactivateIfSingleton(binding: Binding<unknown>): Promise<void> | void {
    if (!binding.activated) {
      return;
    }

    if (isPromise(binding.cache)) {
      return binding.cache.then((resolved) => this._deactivate(binding, resolved));
    }

    return this._deactivate(binding, binding.cache);
  }

  private _deactivateSingletons(bindings: Binding<unknown>[]): void {
    for (const binding of bindings) {
      const result = this._deactivateIfSingleton(binding);

      if (isPromise(result)) {
        throw new Error(ERROR_MSGS.ASYNC_UNBIND_REQUIRED);
      }
    }
  }

  private async _deactivateSingletonsAsync(bindings: Binding<unknown>[]): Promise<void> {
    await Promise.all(bindings.map(b => this._deactivateIfSingleton(b)))
  }

  private _propagateContainerDeactivationThenBindingAndPreDestroy<B>(
    binding: Binding<B>,
    instance: B,
    constructor: NewableFunction
  ): void | Promise<void> {
    if (this.parent) {
      return this._deactivate.bind(this.parent)(binding, instance);
    } else {
      return this._bindingDeactivationAndPreDestroy(binding, instance, constructor);
    }
  }

  private async _propagateContainerDeactivationThenBindingAndPreDestroyAsync<B>(
    binding: Binding<B>,
    instance: B,
    constructor: NewableFunction
  ): Promise<void> {
    if (this.parent) {
      await this._deactivate.bind(this.parent)(binding, instance);
    } else {
      await this._bindingDeactivationAndPreDestroyAsync(binding, instance, constructor);
    }
  }

  private _removeServiceFromDictionary(serviceIdentifier: interfaces.ServiceIdentifier): void {
    try {
      this._bindingDictionary.remove(serviceIdentifier);
    } catch (e) {
      throw new Error(`${ERROR_MSGS.CANNOT_UNBIND} ${getServiceIdentifierAsString(serviceIdentifier)}`);
    }
  }

  private _bindingDeactivationAndPreDestroy<B>(
    binding: Binding<B>,
    instance: B,
    constructor: NewableFunction
  ): void | Promise<void> {
    if (typeof binding.onDeactivation === 'function') {
      const result = binding.onDeactivation(instance);

      if (isPromise(result)) {
        return result.then(() => this._preDestroy(constructor, instance));
      }
    }

    return this._preDestroy(constructor, instance);
  }

  private async _bindingDeactivationAndPreDestroyAsync<B>(
    binding: Binding<B>,
    instance: B,
    constructor: NewableFunction
  ): Promise<void> {
    if (typeof binding.onDeactivation === 'function') {
      await binding.onDeactivation(instance);
    }

    await this._preDestroy(constructor, instance);
  }

}

export { Container };
