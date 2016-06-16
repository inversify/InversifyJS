///<reference path="../interfaces.d.ts" />

interface Bind<T> extends Function {
    (serviceIdentifier: (string|Symbol|INewable<T>)): IBindingToSyntax<T>
}

interface IKernelModule {
    guid: string;
    registry: (bind: Bind<any>) => void;
}
