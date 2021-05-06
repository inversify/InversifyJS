namespace interfaces {
    export type DynamicValue<T> = (context: interfaces.Context) => T | Promise<T>
    export type ContainerResolution<T> = T | Promise<T> | (T | Promise<T>)[]

    type AsyncCallback<TCallback> =
        TCallback extends (...args: infer TArgs) => infer TResult ? (...args: TArgs) => Promise<TResult>
        : never;

    export type BindingScope = (
        SingletonScope<any> |
        TransientScope<any> |
        RequestResolveScope<any>|
        RootRequestScope<any>
    )["type"]
    export type ConfigurableBindingScope = BindingScope | CustomScope<any>["type"];

    export type BindingType =
        (
            InstanceValueProvider<unknown> |
            ConstantValueProvider<unknown> |
            DynamicValueProvider<unknown> |
            FactoryValueProvider<unknown> |
            ProviderValueProvider<unknown> |
            ConstructorValueProvider<unknown>
        )["type"]

    export type TargetType = "ConstructorArgument" | "ClassProperty" | "Variable";

    export interface BindingScopeEnum {
        Request: RequestResolveScope<any>["type"]
        Singleton: SingletonScope<any>["type"];
        Transient: TransientScope<any>["type"];
        RootRequest: RootRequestScope<any>["type"]
    }

    export interface ConfigurableBindingScopeEnum extends BindingScopeEnum{
        Custom: CustomScope<any>["type"];
    }


    export interface BindingTypeEnum {
        ConstantValue: ConstantValueProvider<unknown>["type"];
        Constructor: ConstructorValueProvider<unknown>["type"];
        DynamicValue: DynamicValueProvider<unknown>["type"];
        Factory: FactoryValueProvider<unknown>["type"];
        Instance: InstanceValueProvider<unknown>["type"];
        Provider: ProviderValueProvider<unknown>["type"]
    }

    export interface TargetTypeEnum {
        ConstructorArgument: interfaces.TargetType;
        ClassProperty: interfaces.TargetType;
        Variable: interfaces.TargetType;
    }

    export type Newable<T> = new (...args: any[]) => T;

    export interface Abstract<T> {
        prototype: T;
    }

    export type ServiceIdentifier<T> = (string | symbol | Newable<T> | Abstract<T>);

    export interface Clonable<T> {
        clone(): T;
    }

    export type BindingActivation<T> = (context: interfaces.Context, injectable: T) => T | Promise<T>;

    export type BindingDeactivation<T> = (injectable: T) => void | Promise<void>;

    export interface ValueProvider<TActivated,TValueFrom> extends Clonable<ValueProvider<TActivated,TValueFrom>>{
        valueFrom:TValueFrom
        provideValue(context:Context, childRequests:Request[]):TActivated|Promise<TActivated>
    }

    export type FactoryType = keyof Pick<BindingToSyntax<unknown>,"toFactory"|"toProvider"|"toDynamicValue">;

    export interface FactoryTypeValueProvider<TActivated,TValueFrom> extends ValueProvider<TActivated,TValueFrom>{
        factoryType:FactoryType
    }

    export interface ConstantValueProvider<TActivated> extends ValueProvider<TActivated,TActivated>{
        type:"ConstantValue"
    }

    export interface InstanceValueProvider<TActivated> extends ValueProvider<TActivated,interfaces.Newable<TActivated>>{
        type:"Instance"
    }

    export interface DynamicValueProvider<TActivated> extends
        FactoryTypeValueProvider<TActivated,interfaces.DynamicValue<TActivated>>
        {
            factoryType: "toDynamicValue"
            type: "DynamicValue"
        }

    export interface ConstructorValueProvider<TActivated> extends ValueProvider<TActivated,TActivated>{
        type:"Constructor"
    }

    export interface FactoryValueProvider<TActivated> extends
        FactoryTypeValueProvider<TActivated, (context:interfaces.Context) => TActivated> {
        factoryType:"toFactory";
        type: "Factory"
    }

    export interface ProviderValueProvider<TActivated> extends
        FactoryTypeValueProvider<TActivated, (context:interfaces.Context) => TActivated> {
        factoryType:"toProvider";
        type: "Provider"
    }

    export type ValueProviderType<TActivated> =
        ConstantValueProvider<TActivated> |
        InstanceValueProvider<TActivated> |
        DynamicValueProvider<TActivated> |
        ConstructorValueProvider<TActivated> |
        FactoryValueProvider<TActivated> |
        ProviderValueProvider<TActivated>

    export interface Scope<T>{
        get(binding:Binding<T>,request:Request):Promise<T>|T|undefined
        set(binding:interfaces.Binding<T>,request:Request,resolved:T|Promise<T>):T | Promise<T>
    }

    export interface SingletonScope<T> extends Scope<T>, Clonable<SingletonScope<T>>{
        type:"Singleton",
        resolved: T | Promise<T> | undefined;
    }

    export interface TransientScope<T> extends Scope<T>,Clonable<TransientScope<T>>{
        type:"Transient"
    }

    export interface RequestResolveScope<T> extends Scope<T>, Clonable<RequestResolveScope<T>>{
        type:"Request"
    }

    export interface RootRequestScope<T> extends Scope<T>,Clonable<RootRequestScope<T>>{
        type:"RootRequest"
    }

    export interface CustomScope<T> extends Scope<T>,Clonable<CustomScope<T>>{
        type:"Custom"
    }

    export type ResolveScope<T> = SingletonScope<T> | TransientScope<T> | RequestResolveScope<T> | RootRequestScope<T> | CustomScope<T>

    export type BindingScopeScope<T> = Exclude<interfaces.ResolveScope<T>,interfaces.CustomScope<T>>;

    export interface Binding<TActivated> extends Clonable<Binding<TActivated>> {
        id: number;
        moduleId: ContainerModuleBase["id"];
        serviceIdentifier: ServiceIdentifier<TActivated>;
        constraint: ConstraintFunction;
        scope: ResolveScope<TActivated>;
        onActivation: BindingActivation<TActivated> | null;
        onDeactivation: BindingDeactivation<TActivated> | null;
        valueProvider: ValueProviderType<TActivated> | null | undefined;
        provideValue(context:Context, childRequests:Request[]):TActivated|Promise<TActivated>;
    }

    export type Factory<T> = (...args: any[]) => (((...args: any[]) => T) | T);

    export type FactoryCreator<T> = (context: Context) => Factory<T>;

    export type Provider<T> = (...args: any[]) => (((...args: any[]) => Promise<T>) | Promise<T>);

    export type ProviderCreator<T> = (context: Context) => Provider<T>;

    export interface NextArgs<T = unknown> {
        avoidConstraints: boolean;
        contextInterceptor: ((contexts: Context) => Context);
        isMultiInject: boolean;
        targetType: TargetType;
        serviceIdentifier: interfaces.ServiceIdentifier<T>;
        key?: string | number | symbol;
        value?: any;
    }

    export type Next = (args: NextArgs) => (any | any[]);

    export type Middleware = (next: Next) => Next;

    export type ContextInterceptor = (context: interfaces.Context) => interfaces.Context;

    export interface Context {
        id: number;
        container: Container;
        plan: Plan;
        currentRequest: Request;
        parentContext:Context | undefined;
        addPlan(plan: Plan): void;
        setCurrentRequest(request: Request): void;
        inRootRequestScope():Context;
    }

    export interface ReflectResult {
        [key: string]: Metadata[];
    }

    export interface Metadata {
        key: string | number | symbol;
        value: any;
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
    ) => any;

    export type RequestScope = Map<any, any> | null;

    export interface Request {
        id: number;
        serviceIdentifier: ServiceIdentifier<any>;
        parentContext: Context;
        parentRequest: Request | null;
        childRequests: Request[];
        target: Target;
        bindings: Binding<any>[];
        requestScope: RequestScope;
        rootRequestScope: RequestScope;
        addChildRequest(
            serviceIdentifier: ServiceIdentifier<any>,
            bindings: (Binding<any> | Binding<any>[]),
            target: Target
        ): Request;
    }

    export interface Target {
        id: number;
        serviceIdentifier: ServiceIdentifier<any>;
        type: TargetType;
        name: QueryableString;
        metadata: Metadata[];
        getNamedTag(): interfaces.Metadata | null;
        getCustomTags(): interfaces.Metadata[] | null;
        hasTag(key: string | number | symbol): boolean;
        isArray(): boolean;
        matchesArray(name: interfaces.ServiceIdentifier<any>): boolean;
        isNamed(): boolean;
        isTagged(): boolean;
        isOptional(): boolean;
        matchesNamedTag(name: string): boolean;
        matchesTag(key: string | number | symbol): (value: any) => boolean;
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
        contextStack:Stack<interfaces.Context>;
        bind<T>(serviceIdentifier: ServiceIdentifier<T>): BindingToSyntax<T>;
        rebind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T>;
        rebindAsync<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): Promise<interfaces.BindingToSyntax<T>>
        unbind(serviceIdentifier: ServiceIdentifier<any>): void;
        unbindAsync(serviceIdentifier: interfaces.ServiceIdentifier<any>): Promise<void>;
        unbindAll(): void;
        unbindAllAsync(): Promise<void>;
        isBound(serviceIdentifier: ServiceIdentifier<any>): boolean;
        isBoundNamed(serviceIdentifier: ServiceIdentifier<any>, named: string | number | symbol): boolean;
        isBoundTagged(serviceIdentifier: ServiceIdentifier<any>, key: string | number | symbol, value: any): boolean;
        get<T>(serviceIdentifier: ServiceIdentifier<T>): T;
        getNamed<T>(serviceIdentifier: ServiceIdentifier<T>, named: string | number | symbol): T;
        getTagged<T>(serviceIdentifier: ServiceIdentifier<T>, key: string | number | symbol, value: any): T;
        getAll<T>(serviceIdentifier: ServiceIdentifier<T>): T[];
        getAllTagged<T>(serviceIdentifier: ServiceIdentifier<T>, key: string | number | symbol, value: any): T[];
        getAllNamed<T>(serviceIdentifier: ServiceIdentifier<T>, named: string | number | symbol): T[];
        getAsync<T>(serviceIdentifier: ServiceIdentifier<T>): Promise<T>;
        getNamedAsync<T>(serviceIdentifier: ServiceIdentifier<T>, named: string | number | symbol): Promise<T>;
        getTaggedAsync<T>(serviceIdentifier: ServiceIdentifier<T>, key: string | number | symbol, value: any): Promise<T>;
        getAllAsync<T>(serviceIdentifier: ServiceIdentifier<T>): Promise<T[]>;
        getAllTaggedAsync<T>(serviceIdentifier: ServiceIdentifier<T>, key: string | number | symbol, value: any): Promise<T[]>;
        getAllNamedAsync<T>(serviceIdentifier: ServiceIdentifier<T>, named: string | number | symbol): Promise<T[]>;
        onActivation<T>(serviceIdentifier: ServiceIdentifier<T>, onActivation: BindingActivation<T>): void;
        onDeactivation<T>(serviceIdentifier: ServiceIdentifier<T>, onDeactivation: BindingDeactivation<T>): void;
        resolve<T>(constructorFunction: interfaces.Newable<T>): T;
        load(...modules: ContainerModule[]): void;
        loadAsync(...modules: AsyncContainerModule[]): Promise<void>;
        unload(...modules: ContainerModuleBase[]): void;
        unloadAsync(...modules: ContainerModuleBase[]): Promise<void>
        applyCustomMetadataReader(metadataReader: MetadataReader): void;
        applyMiddleware(...middleware: Middleware[]): void;
        snapshot(): void;
        restore(): void;
        createChild(): Container;
    }

    export type Bind = <T>(serviceIdentifier: ServiceIdentifier<T>) => BindingToSyntax<T>;

    export type Rebind = <T>(serviceIdentifier: ServiceIdentifier<T>) => BindingToSyntax<T>;

    export type Unbind = <T>(serviceIdentifier: ServiceIdentifier<T>) => void;

    export type UnbindAsync = <T>(serviceIdentifier: ServiceIdentifier<T>) => Promise<void>;

    export type IsBound = <T>(serviceIdentifier: ServiceIdentifier<T>) => boolean;

    export interface ContainerModuleBase{
        id: number;
    }

    export interface ContainerModule extends ContainerModuleBase {
        registry: ContainerModuleCallBack;
    }

    export interface AsyncContainerModule extends ContainerModuleBase {
        registry: AsyncContainerModuleCallBack;
    }

    export interface ModuleActivationHandlers{
        onActivations: Lookup<BindingActivation<unknown>>,
        onDeactivations: Lookup<BindingDeactivation<unknown>>
    }

    export interface ModuleActivationStore extends Clonable<ModuleActivationStore> {
        addDeactivation(
            moduleId: ContainerModuleBase["id"],
            serviceIdentifier: ServiceIdentifier<unknown>,
            onDeactivation: interfaces.BindingDeactivation<unknown>
        ): void
        addActivation(
            moduleId: ContainerModuleBase["id"],
            serviceIdentifier: ServiceIdentifier<unknown>,
            onActivation: interfaces.BindingActivation<unknown>
        ): void
        remove(moduleId: ContainerModuleBase["id"]): ModuleActivationHandlers
    }

    export type ContainerModuleCallBack = (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind,
        unbindAsync: interfaces.UnbindAsync,
        onActivation: interfaces.Container["onActivation"],
        onDeactivation: interfaces.Container["onDeactivation"]
    ) => void;

    export type AsyncContainerModuleCallBack = AsyncCallback<ContainerModuleCallBack>;

    export interface ContainerSnapshot {
        bindings: Lookup<Binding<any>>;
        activations: Lookup<BindingActivation<any>>;
        deactivations: Lookup<BindingDeactivation<any>>;
        middleware: Next | null;
        moduleActivationStore: interfaces.ModuleActivationStore;
    }

    export interface Lookup<T> extends Clonable<Lookup<T>> {
        add(serviceIdentifier: ServiceIdentifier<any>, value: T): void;
        getMap(): Map<interfaces.ServiceIdentifier<any>, T[]>;
        get(serviceIdentifier: ServiceIdentifier<any>): T[];
        remove(serviceIdentifier: interfaces.ServiceIdentifier<any>): void;
        removeByCondition(condition: (item: T) => boolean): T[];
        removeIntersection(lookup: interfaces.Lookup<T>): void
        hasKey(serviceIdentifier: ServiceIdentifier<any>): boolean;
        clone(): Lookup<T>;
        traverse(func: (key: interfaces.ServiceIdentifier<any>, value: T[]) => void): void;
    }

    export interface Stack<T> {
        push(entry: T): void;
        pop(): T | undefined;
        peek(): T | undefined;
    }

    export interface BindingOnSyntax<T> {
        onActivation(fn: (context: Context, injectable: T) => T | Promise<T>): BindingWhenSyntax<T>;
        onDeactivation(fn: (injectable: T) => void | Promise<void>): BindingWhenSyntax<T>;
    }

    export interface BindingWhenSyntax<T> {
        when(constraint: (request: Request) => boolean): BindingOnSyntax<T>;
        whenTargetNamed(name: string | number | symbol): BindingOnSyntax<T>;
        whenTargetIsDefault(): BindingOnSyntax<T>;
        whenTargetTagged(tag: string | number | symbol, value: any): BindingOnSyntax<T>;
        whenInjectedInto(parent: (Function | string)): BindingOnSyntax<T>;
        whenParentNamed(name: string | number | symbol): BindingOnSyntax<T>;
        whenParentTagged(tag: string | number | symbol, value: any): BindingOnSyntax<T>;
        whenAnyAncestorIs(ancestor: (Function | string)): BindingOnSyntax<T>;
        whenNoAncestorIs(ancestor: (Function | string)): BindingOnSyntax<T>;
        whenAnyAncestorNamed(name: string | number | symbol): BindingOnSyntax<T>;
        whenAnyAncestorTagged(tag: string | number | symbol, value: any): BindingOnSyntax<T>;
        whenNoAncestorNamed(name: string | number | symbol): BindingOnSyntax<T>;
        whenNoAncestorTagged(tag: string | number | symbol, value: any): BindingOnSyntax<T>;
        whenAnyAncestorMatches(constraint: (request: Request) => boolean): BindingOnSyntax<T>;
        whenNoAncestorMatches(constraint: (request: Request) => boolean): BindingOnSyntax<T>;
    }

    export interface BindingWhenOnSyntax<T> extends BindingWhenSyntax<T>, BindingOnSyntax<T> { }

    export interface BindingInSyntax<T> {
        inSingletonScope(): BindingWhenOnSyntax<T>;
        inTransientScope(): BindingWhenOnSyntax<T>;
        inRequestScope(): BindingWhenOnSyntax<T>;
        inRootRequestScope(): BindingWhenOnSyntax<T>;
        inCustomScope(customScope:Scope<T>): BindingWhenOnSyntax<T>;
    }

    export interface BindingInWhenOnSyntax<T> extends BindingInSyntax<T>, BindingWhenOnSyntax<T> { }

    export interface BindingToSyntax<T> {
        to(constructor: new (...args: any[]) => T): BindingInWhenOnSyntax<T>;
        toSelf(): BindingInWhenOnSyntax<T>;
        toConstantValue(value: T): BindingWhenOnSyntax<T>;
        toDynamicValue(func: DynamicValue<T>): BindingInWhenOnSyntax<T>;
        toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
        toFactory<T2>(factory: FactoryCreator<T2>): BindingWhenOnSyntax<T>;
        toFunction(func: T): BindingWhenOnSyntax<T>;
        toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
        toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
        toService(service: ServiceIdentifier<T>): void;
    }

    export interface ConstraintFunction extends Function {
        metaData?: Metadata;
        (request: Request | null): boolean;
    }

    export interface MetadataReader {
        getConstructorMetadata(constructorFunc: Function): ConstructorMetadata;
        getPropertiesMetadata(constructorFunc: Function): MetadataMap;
    }

    export interface MetadataMap {
        [propertyNameOrArgumentIndex: string]: Metadata[];
    }

    export interface ConstructorMetadata {
        compilerGeneratedMetadata: Function[] | undefined;
        userGeneratedMetadata: MetadataMap;
    }

}

export { interfaces };
