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
    export interface BindingSyntaxFactory<T> {
        getBindingInWhenOnUnbindRebind(): BindingInWhenOnUnbindRebindSyntax<T>;
        getBindingWhenOnUnbindRebind(): BindingWhenOnUnbindRebindSyntax<T>;
        getBindingWhenUnbindRebind(): BindingWhenUnbindRebindSyntax<T>;
        getBindingOnUnbindRebind(): BindingOnUnbindRebindSyntax<T>;
        getBindingTo(): BindingToSyntax<T>;
        getBindingIn(): BindingInSyntax<T>;
        getBindingOn(): BindingOnSyntax<T>;
        getBindingWhen(): BindingWhenSyntax<T>;
        getUnbindRebind(): BindingUnbindRebindSyntax<T>;
    }

    export interface BindingUnbindRebindSyntax<T> {
        unbind(): void;
        rebind<T2 = T>(): BindingToSyntax<T2>;
    }

    export interface BindingOnSyntax<T> {
        onActivation(fn: (context: Context, injectable: T) => T): BindingWhenUnbindRebindSyntax<T>;
    }

    export interface BindingWhenSyntax<T> {
        when(constraint: (request: Request) => boolean): BindingOnUnbindRebindSyntax<T>;
        whenTargetNamed(name: string | number | symbol): BindingOnUnbindRebindSyntax<T>;
        whenTargetIsDefault(): BindingOnUnbindRebindSyntax<T>;
        whenTargetTagged(tag: string | number | symbol, value: any): BindingOnUnbindRebindSyntax<T>;
        whenInjectedInto(parent: (Function | string)): BindingOnUnbindRebindSyntax<T>;
        whenParentNamed(name: string | number | symbol): BindingOnUnbindRebindSyntax<T>;
        whenParentTagged(tag: string | number | symbol, value: any): BindingOnUnbindRebindSyntax<T>;
        whenAnyAncestorIs(ancestor: (Function | string)): BindingOnUnbindRebindSyntax<T>;
        whenNoAncestorIs(ancestor: (Function | string)): BindingOnUnbindRebindSyntax<T>;
        whenAnyAncestorNamed(name: string | number | symbol): BindingOnUnbindRebindSyntax<T>;
        whenAnyAncestorTagged(tag: string | number | symbol, value: any): BindingOnUnbindRebindSyntax<T>;
        whenNoAncestorNamed(name: string | number | symbol): BindingOnUnbindRebindSyntax<T>;
        whenNoAncestorTagged(tag: string | number | symbol, value: any): BindingOnUnbindRebindSyntax<T>;
        whenAnyAncestorMatches(constraint: (request: Request) => boolean): BindingOnUnbindRebindSyntax<T>;
        whenNoAncestorMatches(constraint: (request: Request) => boolean): BindingOnUnbindRebindSyntax<T>;
    }
    export interface BindingInSyntax<T> {
        inSingletonScope(): BindingWhenOnUnbindRebindSyntax<T>;
        inTransientScope(): BindingWhenOnUnbindRebindSyntax<T>;
        inRequestScope(): BindingWhenOnUnbindRebindSyntax<T>;
    }
    export interface BindingInWhenOnUnbindRebindSyntax<T> extends BindingInSyntax<T>, BindingWhenOnUnbindRebindSyntax<T> { }
    export interface BindingWhenOnUnbindRebindSyntax<T> extends
        BindingWhenUnbindRebindSyntax<T>, BindingOnUnbindRebindSyntax<T> { }
    export interface BindingWhenUnbindRebindSyntax<T> extends BindingWhenSyntax<T>, BindingUnbindRebindSyntax<T> {}
    export interface BindingOnUnbindRebindSyntax<T> extends BindingOnSyntax<T>, BindingUnbindRebindSyntax<T> {}

    export interface BindingToSyntax<T> {
        to(constructor: new (...args: any[]) => T): BindingInWhenOnUnbindRebindSyntax<T>;
        toSelf(): BindingInWhenOnUnbindRebindSyntax<T>;
        toConstantValue(value: T): BindingWhenOnUnbindRebindSyntax<T>;
        toDynamicValue(func: (context: Context) => T): BindingInWhenOnUnbindRebindSyntax<T>;
        toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnUnbindRebindSyntax<T>;
        toFactory<T2>(factory: FactoryCreator<T2>): BindingWhenOnUnbindRebindSyntax<T>;
        toFunction(func: T): BindingWhenOnUnbindRebindSyntax<T>;
        toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnUnbindRebindSyntax<T>;
        toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnUnbindRebindSyntax<T>;
        toService(service: ServiceIdentifier<T>): BindingUnbindRebindSyntax<T>;
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
