/// <reference path="../interfaces.d.ts" />

interface IBindingInWhenOnSyntax<T> {
    inTransientScope(): IBindingInWhenOnSyntax<T>;
    inSingletonScope(): IBindingInWhenOnSyntax<T>;
    when(constraint: (request: IRequest) => boolean): IBindingInWhenOnSyntax<T>;
    whenTargetNamed(name: string): IBindingInWhenOnSyntax<T>;
    whenTargetTagged(tag: string, value: any): IBindingInWhenOnSyntax<T>;
    onActivation(fn: (injectable: T) => T): IBindingInWhenOnSyntax<T>;
}
