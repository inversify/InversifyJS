/// <reference path="../interfaces.d.ts" />

interface IBindingInWhenProxySyntax<T> {
    inTransientScope(): IBindingInWhenProxySyntax<T>;
    inSingletonScope(): IBindingInWhenProxySyntax<T>;
    when(constraint: (request: IRequest) => boolean): IBindingInWhenProxySyntax<T>;
    whenTargetNamed(name: string): IBindingInWhenProxySyntax<T>;
    whenTargetTagged(tag: string, value: string): IBindingInWhenProxySyntax<T>;
    proxy(fn: (injectable: T) => T): IBindingInWhenProxySyntax<T>;
}
