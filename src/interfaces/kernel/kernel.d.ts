///<reference path="../interfaces.d.ts" />

interface IKernel {
    bind<T>(runtimeIdentifier: (string|Symbol|INewable<T>)): IBindingToSyntax<T>;
    unbind(runtimeIdentifier: (string|Symbol|any)): void;
    unbindAll(): void;
    get<T>(runtimeIdentifier: (string|Symbol|INewable<T>)): T;
    getAll<T>(runtimeIdentifier: (string|Symbol|INewable<T>)): T[];
    load(...modules: IKernelModule[]): void;
    applyMiddleware(...middleware: IMiddleware[]): void;
}
