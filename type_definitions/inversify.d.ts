// Type definitions for inversify 1.2.2
// Project: https://github.com/inversify/InversifyJS
// Definitions by: inversify <https://github.com/inversify>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare namespace __inversify {

    export interface IMiddleware extends Function {
        (...args: any[]): any;
    }

    export interface IKernelModule extends Function {
        (kernel: IKernel): void;
    }

    interface IKernelOptions {
        middleware?: IMiddleware[];
        modules?: IKernelModule[];
    }

    export interface IKernelConstructor {
        new(options?: IKernelOptions): IKernel;
    }

    export interface IKernel {
        bind<T>(runtimeIdentifier: string): IBindingToSyntax<T>;
        unbind(runtimeIdentifier: string): void;
        unbindAll(): void;
        get<Service>(runtimeIdentifier: string): Service;
        getAll<Service>(runtimeIdentifier: string): Service[];
    }

    interface IBindingWhenSyntax<T> {
        when(constraint: Constraint): void;
    }

    interface IBindingToSyntax<T> {
        to(constructor: { new(...args: any[]): T; }): IBindingInSyntax<T>;
        toValue(value: T): IBindingWhenSyntax<T>;
        toConstructor(constructor: { new(...args: any[]): T; }): IBindingWhenSyntax<T>;
        toFactory(factory: (context) => T): IBindingWhenSyntax<T>;
    }

    interface IBindingInSyntax<T> {
        inTransientScope(): IBindingWhenSyntax<T>;
        inSingletonScope(): IBindingWhenSyntax<T>;
    }

    export interface IBinding<T> {
        runtimeIdentifier: string;
        implementationType: { new(): T; };
        factory: (context) => T;
        cache: T;
        scope: number; // BindingScope
        type: number; // BindingType
    }

    export interface IContext {

            /// Gets the kernel that is driving the activation.
            kernel: IKernel;

            /// Gets or sets the activation plan.
            plan: IPlan;

            addPlan(plan: IPlan);
    }

    export interface IMetadata {
        key: string;
        value: any;
    }

    export interface IPlan {
            parentContext: IContext;
            rootRequest: IRequest;
    }

    export interface ITarget {
        service: IQueryableString;
        name: IQueryableString;
        metadata: Array<IMetadata>;
        isArray(): boolean;
        isNamed(): boolean;
        isTagged(): boolean;
        matchesName(name: string): boolean;
        matchesTag(name: IMetadata): boolean;
    }

    export interface IQueryableString {
        startsWith(searchString: string): boolean;
        endsWith(searchString: string): boolean;
        contains(searchString: string): boolean;
        equals(compareString: string): boolean;
        value(): string;
    }

    export interface IRequest {

            /// The service that was requested.
            service: string;

            /// The parent context.
            parentContext: IContext;

            /// The parent request.
            parentRequest: IRequest;

            // The child requests
            childRequests: IRequest[];

            /// Gets the target that will receive the injection, if any.
            target: ITarget;

            /// Gets the stack of bindings which have been activated by this request.
            bindings: IBinding<any>[];

            // Adds a child request to the request
            addChildRequest(
                service: string,
                bindings: (IBinding<any>|IBinding<any>[]),
                target: ITarget): IRequest;
    }

    export type Constraint = (request: IRequest) => boolean;

    export var Kernel: IKernelConstructor;
    export function Inject(...typeIdentifiers: string[]): (typeConstructor: any) => void;
}

declare module "inversify" {
  export = __inversify;
}
