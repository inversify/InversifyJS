/// <reference path="../interfaces.d.ts" />

interface IBindingOnSyntax<T> {
    onActivation(fn: (context: IContext, injectable: T) => T): IBindingWhenSyntax<T>;
}
