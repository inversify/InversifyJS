import { interfaces } from "../interfaces/interfaces";

class BindingWhenOnUnbindRebindSyntax<T> implements interfaces.BindingWhenOnUnbindRebindSyntax<T> {

    private _bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>;
    public constructor(bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>) {
        this._bindingSyntaxFactory = bindingSyntaxFactory;
    }

    public when(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().when(constraint);
    }

    public whenTargetNamed(name: string): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenTargetNamed(name);
    }

    public whenTargetIsDefault(): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenTargetIsDefault();
    }

    public whenTargetTagged(tag: string, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenTargetTagged(tag, value);
    }

    public whenInjectedInto(parent: (Function | string)): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenInjectedInto(parent);
    }

    public whenParentNamed(name: string): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenParentNamed(name);
    }

    public whenParentTagged(tag: string, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenParentTagged(tag, value);
    }

    public whenAnyAncestorIs(ancestor: (Function | string)): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenAnyAncestorIs(ancestor);
    }

    public whenNoAncestorIs(ancestor: (Function | string)): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenNoAncestorIs(ancestor);
    }

    public whenAnyAncestorNamed(name: string): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenAnyAncestorNamed(name);
    }

    public whenAnyAncestorTagged(tag: string, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenAnyAncestorTagged(tag, value);
    }

    public whenNoAncestorNamed(name: string): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenNoAncestorNamed(name);
    }

    public whenNoAncestorTagged(tag: string, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenNoAncestorTagged(tag, value);
    }

    public whenAnyAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenAnyAncestorMatches(constraint);
    }

    public whenNoAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingWhen().whenNoAncestorMatches(constraint);
    }

    public onActivation(handler: (context: interfaces.Context, injectable: T) => T): interfaces.BindingWhenUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingOn().onActivation(handler);
    }
    public unbind() {
        return this._bindingSyntaxFactory.getUnbindRebind().unbind();
    }
    public rebind<T2 = T>() {
        return this._bindingSyntaxFactory.getUnbindRebind().rebind<T2>();
    }
}

export { BindingWhenOnUnbindRebindSyntax };
