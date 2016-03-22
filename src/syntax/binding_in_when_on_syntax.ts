///<reference path="../interfaces/interfaces.d.ts" />

import BindingInSyntax from "./binding_in_syntax";
import BindingWhenSyntax from "./binding_when_syntax";
import BindingOnSyntax from "./binding_on_syntax";

class BindingInWhenOnSyntax<T> implements IBindingInSyntax<T>, IBindingWhenSyntax<T>, IBindingOnSyntax<T>  {

    private _bindingInSyntax: BindingInSyntax<T>;
    private _bindingWhenSyntax: IBindingWhenSyntax<T>;
    private _bindingOnSyntax: IBindingOnSyntax<T>;
    private _binding: IBinding<T>;

    public constructor(binding: IBinding<T>) {
        this._binding = binding;
        this._bindingWhenSyntax = new BindingWhenSyntax<T>(this._binding);
        this._bindingOnSyntax = new BindingOnSyntax<T>(this._binding);
        this._bindingInSyntax = new BindingInSyntax<T>(binding);
    }

    public inSingletonScope(): IBindingWhenOnSyntax<T> {
        return this._bindingInSyntax.inSingletonScope();
    }

    public when(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.when(constraint);
    }

    public whenTargetNamed(name: string): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenTargetNamed(name);
    }

    public whenTargetTagged(tag: string, value: any): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenTargetTagged(tag, value);
    }

    public whenInjectedInto(parent: (Function|string)): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenInjectedInto(parent);
    }

    public whenParentNamed(name: string): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenParentNamed(name);
    }

    public whenParentTagged(tag: string, value: any): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenParentTagged(tag, value);
    }

    public whenAnyAncestorIs(ancestor: (Function|string)): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenAnyAncestorIs(ancestor);
    }

    public whenNoAncestorIs(ancestor: (Function|string)): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenNoAncestorIs(ancestor);
    }

    public whenAnyAncestorNamed(name: string): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenAnyAncestorNamed(name);
    }

    public whenAnyAncestorTagged(tag: string, value: any): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenAnyAncestorTagged(tag, value);
    }

    public whenNoAncestorNamed(name: string): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenNoAncestorNamed(name);
    }

    public whenNoAncestorTagged(tag: string, value: any): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenNoAncestorTagged(tag, value);
    }

    public whenAnyAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenAnyAncestorMatches(constraint);
    }

    public whenNoAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenNoAncestorMatches(constraint);
    }

    public onActivation(handler: (context: IContext, injectable: T) => T): IBindingWhenSyntax<T> {
        return this._bindingOnSyntax.onActivation(handler);
    }

}

export default BindingInWhenOnSyntax;
