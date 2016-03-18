/// <reference path="../interfaces.d.ts" />

interface IBindingToSyntax<T> {
    to(constructor: { new(...args: any[]): T; }): IBindingInWhenOnSyntax<T>;
    toValue(value: T): IBindingInWhenOnSyntax<T>;
    toConstructor<T2>(constructor: INewable<T2>): IBindingInWhenOnSyntax<T>;
    toFactory<T2>(factory: IFactoryCreator<T2>): IBindingInWhenOnSyntax<T>;
    toAutoFactory<T2>(): IBindingInWhenOnSyntax<T>;
    toProvider<T2>(provider: IProviderCreator<T2>): IBindingInWhenOnSyntax<T>;
}
