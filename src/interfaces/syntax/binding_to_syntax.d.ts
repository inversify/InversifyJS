/// <reference path="../interfaces.d.ts" />

interface IBindingToSyntax<T> {
    to(constructor: { new(...args: any[]): T; }): IBindingInWhenProxySyntax<T>;
    toValue(value: T): IBindingInWhenProxySyntax<T>;
    toConstructor<T2>(constructor: INewable<T2>): IBindingInWhenProxySyntax<T>;
    toFactory<T2>(factory: IFactoryCreator<T2>): IBindingInWhenProxySyntax<T>;
    toAutoFactory<T2>(): IBindingInWhenProxySyntax<T>;
    toProvider<T2>(provider: IProviderCreator<T2>): IBindingInWhenProxySyntax<T>;
}
