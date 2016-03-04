/// <reference path="./binding_in_syntax.d.ts" />
/// <reference path="./binding_when_syntax.d.ts" />

interface IBindingToSyntax<T> {
    to(constructor: { new(...args: any[]): T; }): IBindingInSyntax<T>;
    toValue(value: T): IBindingWhenSyntax<T>;
    toConstructor(constructor: { new(...args: any[]): T; }): IBindingWhenSyntax<T>;
    toFactory(factory: (context) => T): IBindingWhenSyntax<T>;
}
