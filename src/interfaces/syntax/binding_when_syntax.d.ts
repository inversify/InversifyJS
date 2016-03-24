/// <reference path="../interfaces.d.ts" />

interface IBindingWhenSyntax<T> {
    when(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T>;
    whenTargetNamed(name: string): IBindingOnSyntax<T>;
    whenTargetTagged(tag: string, value: any): IBindingOnSyntax<T>;
    whenInjectedInto(parent: (Function|string)): IBindingOnSyntax<T>;
    whenParentNamed(name: string): IBindingOnSyntax<T>;
    whenParentTagged(tag: string, value: any): IBindingOnSyntax<T>;
    whenAnyAncestorIs(ancestor: (Function|string)): IBindingOnSyntax<T>;
    whenNoAncestorIs(ancestor: (Function|string)): IBindingOnSyntax<T>;
    whenAnyAncestorNamed(name: string): IBindingOnSyntax<T>;
    whenAnyAncestorTagged(tag: string, value: any): IBindingOnSyntax<T>;
    whenNoAncestorNamed(name: string): IBindingOnSyntax<T>;
    whenNoAncestorTagged(tag: string, value: any): IBindingOnSyntax<T>;
    whenAnyAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T>;
    whenNoAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T>;
}
