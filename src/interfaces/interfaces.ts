namespace interfaces {

    export type BindingScope = "Singleton" | "Transient" | "Request";

    export type BindingType = "ConstantValue" | "Constructor" | "DynamicValue" | "Factory" |
        "Function" | "Instance" | "Invalid" | "Provider";

    export type TargetType = "ConstructorArgument" | "ClassProperty" | "Variable";

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

    export interface Abstract<T> {
        prototype: T;
    }

    export type ServiceIdentifier<T> = (string | symbol | Newable<T> | Abstract<T>);

    export interface Clonable<T> {
        clone(): T;
    }

    export interface Binding<T> extends Clonable<Binding<T>> {
        id: number;
        moduleId: string;
        activated: boolean;
        serviceIdentifier: ServiceIdentifier<T>;
        constraint: ConstraintFunction;
        dynamicValue: ((context: interfaces.Context) => T) | null;
        scope: BindingScope;
        type: BindingType;
        implementationType: Newable<T> | null;
        factory: FactoryCreator<any> | null;
        provider: ProviderCreator<any> | null;
        onActivation: ((context: interfaces.Context, injectable: T) => T) | null;
        cache: T | null;
    }

    export type Factory<T> = (...args: any[]) => (((...args: any[]) => T) | T);

    export type FactoryCreator<T> = (context: Context) => Factory<T>;

    export type Provider<T> = (...args: any[]) => (((...args: any[]) => Promise<T>) | Promise<T>);

    export type ProviderCreator<T> = (context: Context) => Provider<T>;

    export interface NextArgs {
        avoidConstraints: boolean;
        contextInterceptor: ((contexts: Context) => Context);
        isMultiInject: boolean;
        targetType: TargetType;
        serviceIdentifier: interfaces.ServiceIdentifier<any>;
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
        addPlan(plan: Plan): void;
        setCurrentRequest(request: Request): void;
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
        bind<T>(serviceIdentifier: ServiceIdentifier<T>): BindingToSyntax<T>;
        rebind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T>;
        unbind(serviceIdentifier: ServiceIdentifier<any>): void;
        unbindAll(): void;
        isBound(serviceIdentifier: ServiceIdentifier<any>): boolean;
        isBoundNamed(serviceIdentifier: ServiceIdentifier<any>, named: string | number | symbol): boolean;
        isBoundTagged(serviceIdentifier: ServiceIdentifier<any>, key: string | number | symbol, value: any): boolean;
        get<T>(serviceIdentifier: ServiceIdentifier<T>): T;
        getNamed<T>(serviceIdentifier: ServiceIdentifier<T>, named: string | number | symbol): T;
        getTagged<T>(serviceIdentifier: ServiceIdentifier<T>, key: string | number | symbol, value: any): T;
        getAll<T>(serviceIdentifier: ServiceIdentifier<T>): T[];
        getAllTagged<T>(serviceIdentifier: ServiceIdentifier<T>, key: string | number | symbol, value: any): T[];
        getAllNamed<T>(serviceIdentifier: ServiceIdentifier<T>, named: string | number | symbol): T[];
        resolve<T>(constructorFunction: interfaces.Newable<T>): T;
        load(...modules: ContainerModule[]): void;
        loadAsync(...modules: AsyncContainerModule[]): Promise<void>;
        unload(...modules: ContainerModule[]): void;
        applyCustomMetadataReader(metadataReader: MetadataReader): void;
        applyMiddleware(...middleware: Middleware[]): void;
        snapshot(): void;
        restore(): void;
        createChild(): Container;
    }

    export type Bind = <T>(serviceIdentifier: ServiceIdentifier<T>) => BindingToSyntax<T>;

    export type Rebind = <T>(serviceIdentifier: ServiceIdentifier<T>) => BindingToSyntax<T>;

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
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind
    ) => void;

    export type AsyncContainerModuleCallBack = (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind
    ) => Promise<void>;

    export interface ContainerSnapshot {
        bindings: Lookup<Binding<any>>;
        middleware: Next | null;
    }

    export interface Lookup<T> extends Clonable<Lookup<T>> {
        add(serviceIdentifier: ServiceIdentifier<any>, value: T): void;
        getMap(): Map<interfaces.ServiceIdentifier<any>, T[]>;
        get(serviceIdentifier: ServiceIdentifier<any>): T[];
        remove(serviceIdentifier: interfaces.ServiceIdentifier<any>): void;
        removeByCondition(condition: (item: T) => boolean): void;
        hasKey(serviceIdentifier: ServiceIdentifier<any>): boolean;
        clone(): Lookup<T>;
        traverse(func: (key: interfaces.ServiceIdentifier<any>, value: T[]) => void): void;
    }

    export interface BindingOnSyntax<T> {
        onActivation(fn: (context: Context, injectable: T) => T): BindingWhenSyntax<T>;
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
    }

    export interface BindingInWhenOnSyntax<T> extends BindingInSyntax<T>, BindingWhenOnSyntax<T> { }

    export interface BindingToSyntax<T> {
        to(constructor: new (...args: any[]) => T): BindingInWhenOnSyntax<T>;
        toSelf(): BindingInWhenOnSyntax<T>;
        toConstantValue(value: T): BindingWhenOnSyntax<T>;
        toDynamicValue(func: (context: Context) => T): BindingInWhenOnSyntax<T>;
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
