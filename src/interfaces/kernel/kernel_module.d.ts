///<reference path="../interfaces.d.ts" />

interface IBind extends Function {
    <T>(serviceIdentifier: (string|Symbol|INewable<T>)): IBindingToSyntax<T>;
}

interface IKernelModule {
    guid: string;
    registry: (bind: IBind) => void;
}
