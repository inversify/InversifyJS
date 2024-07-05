import { FactoryType } from '../utils/factory_type';

namespace interfaces {
  export type DynamicValue<T> = (context: interfaces.Context) => T | Promise<T>;
  export type ContainerResolution<T> = T | Promise<T> | (T | Promise<T>)[];

  type AsyncCallback<TCallback> =
    TCallback extends (...args: infer TArgs) => infer TResult ? (...args: TArgs) => Promise<TResult>
    : never;

  export type BindingScope = 'Singleton' | 'Transient' | 'Request';

  export type BindingType = 'ConstantValue' | 'Constructor' | 'DynamicValue' | 'Factory' |
    'Function' | 'Instance' | 'Invalid' | 'Provider';

  export type TargetType = 'ConstructorArgument' | 'ClassProperty' | 'Variable';

  export interface BindingScopeEnum {
    Request: interfaces.BindingScope;
    Singleton: interfaces.BindingScope;
    Transient: interfaces.BindingScope;
  }

  export interface BindingTypeEnum {
    ConstantValue: interfaces.BindingType;
    Constructor: interfaces.BindingType;
    DynamicValue: interfaces.BindingType;
    Factory: interfaces.BindingType;
    Function: interfaces.BindingType;
    Instance: interfaces.BindingType;
    Invalid: interfaces.BindingType;
    Provider: interfaces.BindingType;
  }

  export interface TargetTypeEnum {
    ConstructorArgument: interfaces.TargetType;
    ClassProperty: interfaces.TargetType;
    Variable: interfaces.TargetType;
  }

  export type Newable<T> = new (...args: any[]) => T;

  export type Instance<T> = T & Record<string, () => void>;

  export interface Abstract<T> {
    prototype: T;
  }

  export type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N;

  export type PropertyServiceIdentifier = (string | symbol);
  export type ServiceIdentifier<T = unknown> = (PropertyServiceIdentifier | Newable<T> | Abstract<T>);
  export type BindingMap = Record<PropertyServiceIdentifier, any>;
  export type BindingMapKey<T extends BindingMap> = keyof T & PropertyServiceIdentifier;
  export type ContainerIdentifier<T extends BindingMap> = IfAny<T, ServiceIdentifier, BindingMapKey<T>>;
  export type ContainerBinding<T extends BindingMap, K extends ContainerIdentifier<T> = any> = K extends keyof T ? T[K] :
    K extends Newable<infer C> ? C :
    K extends Abstract<infer D> ? D : never;

  export interface Clonable<T> {
    clone(): T;
  }

  export type BindingActivation<T = unknown> = (context: interfaces.Context, injectable: T) => T | Promise<T>;

  export type BindingDeactivation<T = unknown> = (injectable: T) => void | Promise<void>;

  export interface Binding<TActivated = unknown> extends Clonable<Binding<TActivated>> {
    id: number;
    moduleId: ContainerModuleBase['id'];
    activated: boolean;
    serviceIdentifier: ServiceIdentifier<TActivated>;
    constraint: ConstraintFunction;
    dynamicValue: DynamicValue<TActivated> | null;
    scope: BindingScope;
    type: BindingType;
    implementationType: Newable<TActivated> | TActivated | null;
    factory: FactoryCreator<unknown> | null;
    provider: ProviderCreator<unknown> | null;
    onActivation: BindingActivation<TActivated> | null;
    onDeactivation: BindingDeactivation<TActivated> | null;
    cache: null | TActivated | Promise<TActivated>;
  }

  export type SimpleFactory<T, U extends unknown[] = unknown[]> = (...args: U) => T;

  export type MultiFactory<T, U extends unknown[] = unknown[], V extends unknown[] = unknown[]> = (...args: U) => SimpleFactory<T, V>;

  export type Factory<T, U extends unknown[] = unknown[], V extends unknown[] = unknown[]> = SimpleFactory<T, U> | MultiFactory<T, U, V>;

  export type FactoryCreator<T, U extends unknown[] = unknown[], V extends unknown[] = unknown[]> = (context: Context) => Factory<T, U, V>;

  export type AutoNamedFactory<T> = SimpleFactory<T, [string]>;

  export type AutoFactory<T> = SimpleFactory<T, []>;

  export type FactoryTypeFunction<T = unknown> = (context: interfaces.Context) => T | Promise<T>

  export interface FactoryDetails {
    factoryType: FactoryType,
    factory: FactoryTypeFunction | null
  };

  export type Provider<T> = (...args: any[]) => (((...args: any[]) => Promise<T>) | Promise<T>);

  export type ProviderCreator<T> = (context: Context) => Provider<T>;

  export interface NextArgs<T = unknown> {
    avoidConstraints: boolean;
    contextInterceptor: ((contexts: Context) => Context);
    isMultiInject: boolean;
    targetType: TargetType;
    serviceIdentifier: interfaces.ServiceIdentifier<T>;
    key?: string | number | symbol | undefined;
    value?: unknown;
  }

  export type Next = (args: NextArgs) => (unknown | unknown[]);

  export type Middleware = (next: Next) => Next;

  export type ContextInterceptor = (context: interfaces.Context) => interfaces.Context;

  export interface Context {
    id: number;
    container: Container;
    plan: Plan;
    currentRequest: Request;
    addPlan(plan: Plan): void;
    setCurrentRequest(request: Request): void;
  }

  export type MetadataOrMetadataArray = Metadata | Metadata[];

  export interface Metadata<TValue = unknown> {
    key: string | number | symbol;
    value: TValue;
  }

  export interface Plan {
    parentContext: Context;
    rootRequest: Request;
  }

  export interface QueryableString {
    startsWith(searchString: string): boolean;
    endsWith(searchString: string): boolean;
    contains(searchString: string): boolean;
    equals(compareString: string): boolean;
    value(): string;
  }

  export type ResolveRequestHandler = (
    request: interfaces.Request
  ) => unknown;

  export type RequestScope = Map<unknown, unknown>;

  export interface Request {
    id: number;
    serviceIdentifier: ServiceIdentifier;
    parentContext: Context;
    parentRequest: Request | null;
    childRequests: Request[];
    target: Target;
    bindings: Binding<unknown>[];
    requestScope: RequestScope | null;
    addChildRequest(
      serviceIdentifier: ServiceIdentifier,
      bindings: (Binding<unknown> | Binding<unknown>[]),
      target: Target
    ): Request;
  }

  export interface Target {
    id: number;
    serviceIdentifier: ServiceIdentifier;
    type: TargetType;
    name: QueryableString;
    identifier: string | symbol;
    metadata: Metadata[];
    getNamedTag(): interfaces.Metadata<string> | null;
    getCustomTags(): interfaces.Metadata[] | null;
    hasTag(key: string | number | symbol): boolean;
    isArray(): boolean;
    matchesArray(name: interfaces.ServiceIdentifier): boolean;
    isNamed(): boolean;
    isTagged(): boolean;
    isOptional(): boolean;
    matchesNamedTag(name: string): boolean;
    matchesTag(key: string | number | symbol): (value: unknown) => boolean;
  }

  export interface ContainerOptions {
    autoBindInjectable?: boolean;
    defaultScope?: BindingScope | undefined;
    skipBaseClassChecks?: boolean;
  }

  export interface Container<T extends BindingMap = any, P extends BindingMap = any> {
    id: number;
    parent: Container<P> | null;
    options: ContainerOptions;
    bind: Bind<T>;
    rebind: Rebind<T>;
    rebindAsync: RebindAsync<T>;
    unbind: Unbind<T>;
    unbindAsync: UnbindAsync<T>;
    unbindAll(): void;
    unbindAllAsync(): Promise<void>;
    isBound: IsBound<T>;
    isCurrentBound: IsBound<T>;
    isBoundNamed: <K extends ContainerIdentifier<T>>(serviceIdentifier: K, named: PropertyKey) => boolean;
    isBoundTagged: <K extends interfaces.ContainerIdentifier<T>>(
      serviceIdentifier: K,
      key: PropertyKey,
      value: unknown,
    ) => boolean;
    get: <B extends ContainerBinding<T, K>, K extends ContainerIdentifier<T> = any>(serviceIdentifier: K) => B;
    getNamed: <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      serviceIdentifier: K,
      named: PropertyKey,
    ) => B;
    getTagged: <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      serviceIdentifier: K,
      key: PropertyKey,
      value: unknown,
    ) => B;
    getAll: <B extends ContainerBinding<T, K>, K extends ContainerIdentifier<T> = any>(serviceIdentifier: K) => B[];
    getAllTagged: <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      serviceIdentifier: K,
      key: PropertyKey,
      value: unknown,
    ) => B[];
    getAllNamed: <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      serviceIdentifier: K,
      named: PropertyKey,
    ) => B[];
    getAsync: <B extends ContainerBinding<T, K>, K extends ContainerIdentifier<T> = any>(
      serviceIdentifier: K,
    ) => Promise<B>;
    getNamedAsync: <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      serviceIdentifier: K,
      named: PropertyKey,
    ) => Promise<B>;
    getTaggedAsync: <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      serviceIdentifier: K,
      key: PropertyKey,
      value: unknown,
    ) => Promise<B>;
    getAllAsync: <B extends ContainerBinding<T, K>, K extends ContainerIdentifier<T> = any>(serviceIdentifier: K) => Promise<B[]>;
    getAllTaggedAsync: <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      serviceIdentifier: K,
      key: PropertyKey,
      value: unknown,
    ) => Promise<B[]>;
    getAllNamedAsync: <B extends interfaces.ContainerBinding<T, K>, K extends interfaces.ContainerIdentifier<T> = any>(
      serviceIdentifier: K,
      named: PropertyKey,
    ) => Promise<B[]>;
    onActivation<B extends ContainerBinding<T, K>, K extends ContainerIdentifier<T> = any>(
      serviceIdentifier: K,
      onActivation: BindingActivation<B>,
    ): void;
    onDeactivation<B extends ContainerBinding<T, K>, K extends ContainerIdentifier<T> = any>(
      serviceIdentifier: K,
      onDeactivation: BindingDeactivation<B>,
    ): void;
    resolve<B>(constructorFunction: Newable<B>): B;
    load(...modules: ContainerModule[]): void;
    loadAsync(...modules: AsyncContainerModule[]): Promise<void>;
    unload(...modules: ContainerModuleBase[]): void;
    unloadAsync(...modules: ContainerModuleBase[]): Promise<void>
    applyCustomMetadataReader(metadataReader: MetadataReader): void;
    applyMiddleware(...middleware: Middleware[]): void;
    snapshot(): void;
    restore(): void;
    createChild<C extends BindingMap = any>(containerOptions?: ContainerOptions): Container<C, T>;
  }

  export type Bind<T extends BindingMap = any> =
    <B extends ContainerBinding<T, K>, K extends ContainerIdentifier<T> = any>(serviceIdentifier: K) => BindingToSyntax<B>;

  export type Rebind<T extends BindingMap = any> = Bind<T>;

  export type RebindAsync<T extends BindingMap = any> =
  <B extends ContainerBinding<T, K>, K extends ContainerIdentifier<T> = any>(serviceIdentifier: K) => Promise<BindingToSyntax<B>>;

  export type Unbind<T extends BindingMap = any> = <K extends ContainerIdentifier<T>>(serviceIdentifier: K) => void;

  export type UnbindAsync<T extends BindingMap = any> =
    <K extends ContainerIdentifier<T>>(serviceIdentifier: K) => Promise<void>;

  export type IsBound<T extends BindingMap = any> = <K extends ContainerIdentifier<T>>(serviceIdentifier: K) => boolean;

  export interface ContainerModuleBase {
    id: number;
  }

  export interface ContainerModule extends ContainerModuleBase {
    registry: ContainerModuleCallBack;
  }

  export interface AsyncContainerModule extends ContainerModuleBase {
    registry: AsyncContainerModuleCallBack;
  }

  export interface ModuleActivationHandlers {
    onActivations: Lookup<BindingActivation<unknown>>,
    onDeactivations: Lookup<BindingDeactivation<unknown>>
  }

  export interface ModuleActivationStore extends Clonable<ModuleActivationStore> {
    addDeactivation(
      moduleId: ContainerModuleBase['id'],
      serviceIdentifier: ServiceIdentifier<unknown>,
      onDeactivation: interfaces.BindingDeactivation<unknown>
    ): void
    addActivation(
      moduleId: ContainerModuleBase['id'],
      serviceIdentifier: ServiceIdentifier<unknown>,
      onActivation: interfaces.BindingActivation<unknown>
    ): void
    remove(moduleId: ContainerModuleBase['id']): ModuleActivationHandlers
  }

  export type ContainerModuleCallBack = (
    bind: interfaces.Bind,
    unbind: interfaces.Unbind,
    isBound: interfaces.IsBound,
    rebind: interfaces.Rebind,
    unbindAsync: interfaces.UnbindAsync,
    onActivation: interfaces.Container['onActivation'],
    onDeactivation: interfaces.Container['onDeactivation']
  ) => void;

  export type AsyncContainerModuleCallBack = AsyncCallback<ContainerModuleCallBack>;

  export interface ContainerSnapshot {
    bindings: Lookup<Binding<unknown>>;
    activations: Lookup<BindingActivation<unknown>>;
    deactivations: Lookup<BindingDeactivation<unknown>>;
    middleware: Next | null;
    moduleActivationStore: interfaces.ModuleActivationStore;
  }

  export interface Lookup<T> extends Clonable<Lookup<T>> {
    add(serviceIdentifier: ServiceIdentifier, value: T): void;
    getMap(): Map<interfaces.ServiceIdentifier, T[]>;
    get(serviceIdentifier: ServiceIdentifier): T[];
    remove(serviceIdentifier: interfaces.ServiceIdentifier): void;
    removeByCondition(condition: (item: T) => boolean): T[];
    removeIntersection(lookup: interfaces.Lookup<T>): void
    hasKey(serviceIdentifier: ServiceIdentifier): boolean;
    clone(): Lookup<T>;
    traverse(func: (key: interfaces.ServiceIdentifier, value: T[]) => void): void;
  }

  export interface BindingOnSyntax<T> {
    onActivation(fn: (context: Context, injectable: T) => T | Promise<T>): BindingWhenSyntax<T>;
    onDeactivation(fn: (injectable: T) => void | Promise<void>): BindingWhenSyntax<T>;
  }

  export interface BindingWhenSyntax<T> {
    when(constraint: (request: Request) => boolean): BindingOnSyntax<T>;
    whenTargetNamed(name: string | number | symbol): BindingOnSyntax<T>;
    whenTargetIsDefault(): BindingOnSyntax<T>;
    whenTargetTagged(tag: string | number | symbol, value: unknown): BindingOnSyntax<T>;
    whenInjectedInto(parent: (NewableFunction | string)): BindingOnSyntax<T>;
    whenParentNamed(name: string | number | symbol): BindingOnSyntax<T>;
    whenParentTagged(tag: string | number | symbol, value: unknown): BindingOnSyntax<T>;
    whenAnyAncestorIs(ancestor: (NewableFunction | string)): BindingOnSyntax<T>;
    whenNoAncestorIs(ancestor: (NewableFunction | string)): BindingOnSyntax<T>;
    whenAnyAncestorNamed(name: string | number | symbol): BindingOnSyntax<T>;
    whenAnyAncestorTagged(tag: string | number | symbol, value: unknown): BindingOnSyntax<T>;
    whenNoAncestorNamed(name: string | number | symbol): BindingOnSyntax<T>;
    whenNoAncestorTagged(tag: string | number | symbol, value: unknown): BindingOnSyntax<T>;
    whenAnyAncestorMatches(constraint: (request: Request) => boolean): BindingOnSyntax<T>;
    whenNoAncestorMatches(constraint: (request: Request) => boolean): BindingOnSyntax<T>;
  }

  export interface BindingWhenOnSyntax<T> extends BindingWhenSyntax<T>, BindingOnSyntax<T> { }

  export interface BindingInSyntax<T> {
    inSingletonScope(): BindingWhenOnSyntax<T>;
    inTransientScope(): BindingWhenOnSyntax<T>;
    inRequestScope(): BindingWhenOnSyntax<T>;
  }

  export interface BindingInWhenOnSyntax<T> extends BindingInSyntax<T>, BindingWhenOnSyntax<T> { }

  export interface BindingToSyntax<T> {
    to(constructor: Newable<T>): BindingInWhenOnSyntax<T>;
    toSelf(): BindingInWhenOnSyntax<T>;
    toConstantValue(value: T): BindingWhenOnSyntax<T>;
    toDynamicValue(func: DynamicValue<T>): BindingInWhenOnSyntax<T>;
    toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
    toFactory<T2, T3 extends unknown[] = unknown[], T4 extends unknown[] = unknown[]>(
      factory: FactoryCreator<T2, T3, T4>): BindingWhenOnSyntax<T>;
    toFunction(func: T): BindingWhenOnSyntax<T>;
    toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
    toAutoNamedFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
    toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
    toService(service: ServiceIdentifier<T>): void;
  }

  export interface ConstraintFunction {
    metaData?: Metadata;
    (request: Request | null): boolean;
  }

  export interface MetadataReader {
    getConstructorMetadata(constructorFunc: NewableFunction): ConstructorMetadata;
    getPropertiesMetadata(constructorFunc: NewableFunction): MetadataMap;
  }

  export interface MetadataMap {
    [propertyNameOrArgumentIndex: string | symbol]: Metadata[];
  }

  export interface ConstructorMetadata {
    compilerGeneratedMetadata: NewableFunction[] | undefined;
    userGeneratedMetadata: MetadataMap;
  }

}

export { interfaces };
