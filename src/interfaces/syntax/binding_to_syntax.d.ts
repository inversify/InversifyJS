/// <reference path="../interfaces.d.ts" />

interface IBindingToSyntax<T> {
    to(constructor: { new(...args: any[]): T; }): IBindingInWhenOnSyntax<T>;
    toValue(value: T): IBindingWhenOnSyntax<T>;
    toConstructor<T2>(constructor: INewable<T2>): IBindingWhenOnSyntax<T>;
    toFactory<T2>(factory: IFactoryCreator<T2>): IBindingWhenOnSyntax<T>;
    toAutoFactory<T2>(serviceIdentifier: (string|Symbol|INewable<T2>)): IBindingWhenOnSyntax<T>;
    toProvider<T2>(provider: IProviderCreator<T2>): IBindingWhenOnSyntax<T>;
}
