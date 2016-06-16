///<reference path="../interfaces.d.ts" />

interface IKernel {
    bind<T>(serviceIdentifier: (string|Symbol|INewable<T>)): IBindingToSyntax<T>;
    unbind(serviceIdentifier: (string|Symbol|INewable<any>)): void;
    unbindAll(): void;
    isBound(serviceIdentifier: (string|Symbol|INewable<any>)): boolean;
    get<T>(serviceIdentifier: (string|Symbol|INewable<T>)): T;
    getNamed<T>(serviceIdentifier: (string|Symbol|INewable<T>), named: string): T;
    getTagged<T>(serviceIdentifier: (string|Symbol|INewable<T>), key: string, value: any): T;
    getAll<T>(serviceIdentifier: (string|Symbol|INewable<T>)): T[];
    load(...modules: IKernelModule[]): void;
    applyMiddleware(...middleware: IMiddleware[]): void;
    getServiceIdentifierAsString(serviceIdentifier: (string|Symbol|INewable<any>)): string;
    snapshot(): void;
    restore(): void;
}
