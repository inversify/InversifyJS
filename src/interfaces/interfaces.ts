import { AnyMetadataValue } from '../planning/metadata';

export type BindingScope = 'Singleton' | 'Transient' | 'Request';

export type BindingType =
  | 'ConstantValue'
  | 'Constructor'
  | 'DynamicValue'
  | 'Factory'
  | 'Function'
  | 'Instance'
  | 'Invalid'
  | 'Provider';

export type TargetType = 'ConstructorArgument' | 'ClassProperty' | 'Variable';

export interface BindingScopeEnum {
  Request: BindingScope;
  Singleton: BindingScope;
  Transient: BindingScope;
}

export interface BindingTypeEnum {
  ConstantValue: BindingType;
  Constructor: BindingType;
  DynamicValue: BindingType;
  Factory: BindingType;
  Function: BindingType;
  Instance: BindingType;
  Invalid: BindingType;
  Provider: BindingType;
}

export interface TargetTypeEnum {
  ConstructorArgument: TargetType;
  ClassProperty: TargetType;
  Variable: TargetType;
}

export type IndexObject = Record<string, unknown>;

export type Newable<T = IndexObject> = new (...args: unknown[]) => T;

export interface Abstract<T> {
  prototype: T;
}

export type ServiceIdentifier<T> = string | symbol | Newable<T> | Abstract<T>;

export interface Clonable<T> {
  clone(): T;
}

export interface Binding<T> extends Clonable<Binding<T>> {
  id: number;
  moduleId: string;
  activated: boolean;
  serviceIdentifier: ServiceIdentifier<T>;
  constraint: ConstraintFunction;
  dynamicValue: ((context: Context) => T) | null;
  scope: BindingScope;
  type: BindingType;
  implementationType: Newable<T> | null;
  factory: FactoryCreator<unknown> | null;
  provider: ProviderCreator<unknown> | null;
  onActivation: ((context: Context, injectable: T) => T) | null;
  cache: T | null;
}

export type Factory<T> = (
  ...args: unknown[]
) => ((...args: unknown[]) => T) | T;

export type FactoryCreator<T> = (context: Context) => Factory<T>;

export type Provider<T> = (
  ...args: unknown[]
) => ((...args: unknown[]) => Promise<T>) | Promise<T>;

export type ProviderCreator<T> = (context: Context) => Provider<T>;

export interface NextArgs {
  avoidConstraints: boolean;
  contextInterceptor: (contexts: Context) => Context;
  isMultiInject: boolean;
  targetType: TargetType;
  serviceIdentifier: ServiceIdentifier<unknown>;
  key?: string | number | symbol;
  value?: unknown;
}

export type Next<T = unknown> = (args: NextArgs) => T | T[];

export type Middleware = (next: Next) => Next;

export type ContextInterceptor = (context: Context) => Context;

export type MiddlewareResult<T> = (T | T[]) | null;

export interface Context {
  id: number;
  container: Container;
  plan: Plan;
  currentRequest: Request;
  addPlan(plan: Plan): void;
  setCurrentRequest(request: Request): void;
}

export interface ReflectResult {
  [key: string]: Metadata[];
}

export interface Metadata {
  key: string | number | symbol;
  value: AnyMetadataValue;
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

export type ResolveRequestHandler = (request: Request) => unknown;

export type RequestScope = Map<unknown, unknown> | null;

export interface Request {
  id: number;
  serviceIdentifier: ServiceIdentifier<unknown>;
  parentContext: Context;
  parentRequest: Request | null;
  childRequests: Request[];
  target: Target;
  bindings: Binding<IndexObject>[];
  requestScope: RequestScope;
  addChildRequest(
    serviceIdentifier: ServiceIdentifier<unknown>,
    bindings: Binding<unknown> | Binding<unknown>[],
    target: Target
  ): Request;
}

export interface Target {
  id: number;
  serviceIdentifier: ServiceIdentifier<IndexObject>;
  type: TargetType;
  name: QueryableString;
  metadata: Metadata[];
  getNamedTag(): Metadata | null;
  getCustomTags(): Metadata[] | null;
  hasTag(key: string | number | symbol): boolean;
  isArray(): boolean;
  matchesArray(name: ServiceIdentifier<IndexObject>): boolean;
  isNamed(): boolean;
  isTagged(): boolean;
  isOptional(): boolean;
  matchesNamedTag(name: string): boolean;
  matchesTag(key: string | number | symbol): (value: unknown) => boolean;
}

export interface TargetMetadataMap {
  inject: string | MetadataMap;
  multiInject: string | MetadataMap;
  // targetName?: string | MetadataMap;
  // unmanaged?: string | MetadataMap;
  // [ key: string ]: string | boolean;
}

export interface ContainerOptions {
  autoBindInjectable?: boolean;
  defaultScope?: BindingScope;
  skipBaseClassChecks?: boolean;
}

export interface Container {
  id: number;
  parent: Container | null;
  options: ContainerOptions;
  bind<T>(serviceIdentifier: ServiceIdentifier<T>): BindingToSyntax<T>;
  rebind<T>(serviceIdentifier: ServiceIdentifier<T>): BindingToSyntax<T>;
  unbind<T = unknown>(serviceIdentifier: ServiceIdentifier<T>): void;
  unbindAll(): void;
  isBound<T = unknown>(serviceIdentifier: ServiceIdentifier<T>): boolean;
  isBoundNamed<T = unknown>(
    serviceIdentifier: ServiceIdentifier<T>,
    named: string | number | symbol
  ): boolean;
  isBoundTagged<T = unknown>(
    serviceIdentifier: ServiceIdentifier<T>,
    key: string | number | symbol,
    value: unknown
  ): boolean;
  get<T>(serviceIdentifier: ServiceIdentifier<T>): T;
  getNamed<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    named: string | number | symbol
  ): T;
  getTagged<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    key: string | number | symbol,
    value: unknown
  ): T;
  getAll<T>(serviceIdentifier: ServiceIdentifier<T>): T[];
  getAllTagged<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    key: string | number | symbol,
    value: unknown
  ): T[];
  getAllNamed<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    named: string | number | symbol
  ): T[];
  resolve<T>(constructorFunction: Newable<T>): T;
  load(...modules: ContainerModule[]): void;
  loadAsync(...modules: AsyncContainerModule[]): Promise<void>;
  unload(...modules: ContainerModule[]): void;
  applyCustomMetadataReader(metadataReader: MetadataReader): void;
  applyMiddleware(...middleware: Middleware[]): void;
  snapshot(): void;
  restore(): void;
  createChild(): Container;
}

export type Bind = <T>(
  serviceIdentifier: ServiceIdentifier<T>
) => BindingToSyntax<T>;

export type Rebind = <T>(
  serviceIdentifier: ServiceIdentifier<T>
) => BindingToSyntax<T>;

export type Unbind = <T>(serviceIdentifier: ServiceIdentifier<T>) => void;

export type IsBound = <T>(serviceIdentifier: ServiceIdentifier<T>) => boolean;

export interface ContainerModule {
  id: number;
  registry: ContainerModuleCallBack;
}

export interface AsyncContainerModule {
  id: number;
  registry: AsyncContainerModuleCallBack;
}

export type ContainerModuleCallBack = (
  bind: Bind,
  unbind: Unbind,
  isBound: IsBound,
  rebind: Rebind
) => void;

export type AsyncContainerModuleCallBack = (
  bind: Bind,
  unbind: Unbind,
  isBound: IsBound,
  rebind: Rebind
) => Promise<void>;

export interface ContainerSnapshot {
  bindings: Lookup<Binding<unknown>>;
  middleware: Next | null;
}

export interface Lookup<T> extends Clonable<Lookup<T>> {
  add(serviceIdentifier: ServiceIdentifier<unknown>, value: T): void;
  getMap(): Map<ServiceIdentifier<unknown>, T[]>;
  get(serviceIdentifier: ServiceIdentifier<unknown>): T[];
  remove(serviceIdentifier: ServiceIdentifier<unknown>): void;
  removeByCondition(condition: (item: T) => boolean): void;
  hasKey(serviceIdentifier: ServiceIdentifier<unknown>): boolean;
  clone(): Lookup<T>;
  traverse(func: (key: ServiceIdentifier<unknown>, value: T[]) => void): void;
}

export interface BindingOnSyntax<T> {
  onActivation(
    fn: (context: Context, injectable: T) => T
  ): BindingWhenSyntax<T>;
}

export interface BindingWhenSyntax<T> {
  when(constraint: (request: Request) => boolean): BindingOnSyntax<T>;
  whenTargetNamed(name: string | number | symbol): BindingOnSyntax<T>;
  whenTargetIsDefault(): BindingOnSyntax<T>;
  whenTargetTagged(
    tag: string | number | symbol,
    value: unknown
  ): BindingOnSyntax<T>;
  whenInjectedInto(parent: NewableFunction | string): BindingOnSyntax<T>;
  whenParentNamed(name: string | number | symbol): BindingOnSyntax<T>;
  whenParentTagged(
    tag: string | number | symbol,
    value: unknown
  ): BindingOnSyntax<T>;
  whenAnyAncestorIs(ancestor: NewableFunction | string): BindingOnSyntax<T>;
  whenNoAncestorIs(ancestor: NewableFunction | string): BindingOnSyntax<T>;
  whenAnyAncestorNamed(name: string | number | symbol): BindingOnSyntax<T>;
  whenAnyAncestorTagged(
    tag: string | number | symbol,
    value: unknown
  ): BindingOnSyntax<T>;
  whenNoAncestorNamed(name: string | number | symbol): BindingOnSyntax<T>;
  whenNoAncestorTagged(
    tag: string | number | symbol,
    value: unknown
  ): BindingOnSyntax<T>;
  whenAnyAncestorMatches(
    constraint: (request: Request) => boolean
  ): BindingOnSyntax<T>;
  whenNoAncestorMatches(
    constraint: (request: Request) => boolean
  ): BindingOnSyntax<T>;
}

export interface BindingWhenOnSyntax<T> extends
  BindingWhenSyntax<T>,
  BindingOnSyntax<T> { }

export interface BindingInSyntax<T> {
  inSingletonScope(): BindingWhenOnSyntax<T>;
  inTransientScope(): BindingWhenOnSyntax<T>;
  inRequestScope(): BindingWhenOnSyntax<T>;
}

export interface BindingInWhenOnSyntax<T>
  extends BindingInSyntax<T>,
  BindingWhenOnSyntax<T> { }

export interface BindingToSyntax<T> {
  to(constructor: new (...args: unknown[]) => T): BindingInWhenOnSyntax<T>;
  toSelf(): BindingInWhenOnSyntax<T>;
  toConstantValue(value: T): BindingWhenOnSyntax<T>;
  toDynamicValue(func: (context: Context) => T): BindingInWhenOnSyntax<T>;
  toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
  toFactory<T2>(factory: FactoryCreator<T2>): BindingWhenOnSyntax<T>;
  toFunction(func: T): BindingWhenOnSyntax<T>;
  toAutoFactory<T2>(
    serviceIdentifier: ServiceIdentifier<T2>
  ): BindingWhenOnSyntax<T>;
  toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
  toService(service: ServiceIdentifier<T>): void;
}

export interface ConstraintFunction extends Function {
  metaData?: Metadata;
  (request: Request | null): boolean;
}

export interface MetadataReader {
  getConstructorMetadata(constructorFunc: NewableFunction): ConstructorMetadata;
  getPropertiesMetadata(constructorFunc: NewableFunction): MetadataMap;
}

export interface MetadataMap {
  [propertyNameOrArgumentIndex: string]: Metadata[];
}

export interface ConstructorMetadata {
  compilerGeneratedMetadata: NewableFunction[] | undefined;
  userGeneratedMetadata: MetadataMap;
}
