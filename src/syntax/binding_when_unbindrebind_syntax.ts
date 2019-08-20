import { interfaces } from "../inversify";

export class BindingWhenUnbindRebindSyntax<T> implements interfaces.BindingWhenUnbindRebindSyntax<T> {
    private _bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>;
    constructor(bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>) {
        this._bindingSyntaxFactory = bindingSyntaxFactory;
    }
    public when(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().when(constraint);
    }
    public whenTargetNamed(name: string | number | symbol): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenTargetNamed(name);
    }
    public whenTargetIsDefault(): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenTargetIsDefault();
    }
    public whenTargetTagged(tag: string | number | symbol, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenTargetTagged(tag, value);
    }
    public whenInjectedInto(parent: (Function | string)): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenInjectedInto(parent);
    }
    public whenParentNamed(name: string | number | symbol): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenParentNamed(name);
    }
    public whenParentTagged(tag: string | number | symbol, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenParentTagged(tag, value);
    }
    public whenAnyAncestorIs(ancestor: (Function | string)): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenAnyAncestorIs(ancestor);
    }
    public whenNoAncestorIs(ancestor: (Function | string)): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenNoAncestorIs(ancestor);
    }
    public whenAnyAncestorNamed(name: string | number | symbol): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenAnyAncestorNamed(name);
    }
    public whenAnyAncestorTagged(tag: string | number | symbol, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenAnyAncestorTagged(tag, value);
    }
    public whenNoAncestorNamed(name: string | number | symbol): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenNoAncestorNamed(name);
    }
    public whenNoAncestorTagged(tag: string | number | symbol, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenNoAncestorTagged(tag, value);
    }
    public whenAnyAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenAnyAncestorMatches(constraint);
    }
    public whenNoAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenNoAncestorMatches(constraint);
    }
    public unbind() {
        this._bindingSyntaxFactory.getUnbindRebind().unbind();
    }
    public rebind<T2 = T>() {
        return this._bindingSyntaxFactory.getUnbindRebind().rebind<T2>();
    }
}
