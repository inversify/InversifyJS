/// <reference path="./binding_when_syntax.d.ts" />

interface IBindingInSyntax<T> {
    inTransientScope(): IBindingWhenSyntax<T>;
    inSingletonScope(): IBindingWhenSyntax<T>;
}
