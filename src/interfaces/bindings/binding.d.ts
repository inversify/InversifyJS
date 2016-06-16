/// <reference path="../interfaces.d.ts" />

interface IBinding<T> extends IClonable<IBinding<T>> {
    guid: string;
    moduleId: string;
    activated: boolean;
    serviceIdentifier: (string|Symbol|INewable<T>);
    implementationType: INewable<T>;
    factory: IFactoryCreator<any>;
    provider: IProviderCreator<any>;
    constraint: (request: IRequest) => boolean;
    onActivation: (context: IContext, injectable: T) => T;
    cache: T;
    dynamicValue: () => T;
    scope: number; // BindingScope
    type: number; // BindingType
}
