/// <reference path="./binding_in_syntax.d.ts" />
/// <reference path="./binding_when_syntax.d.ts" />

interface IBindingToSyntax<T> {
    to(constructor: { new(...args: any[]): T; }): IBindingInSyntax<T>;
    toValue(value: T): IBindingWhenSyntax<T>;
    toConstructor<T2>(constructor: INewable<T2>): IBindingWhenSyntax<T>;
    toFactory<T2>(factory: IFactoryCreator<T2>): IBindingWhenSyntax<T>;
    toProvider<T2>(provider: IProviderCreator<T2>): IBindingWhenSyntax<T>;
}
