import { interfaces } from "../inversify";

export class BindingOnUnbindRebindSyntax<T> implements interfaces.BindingOnUnbindRebindSyntax<T> {
    private _bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>;
    constructor(bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>) {
        this._bindingSyntaxFactory = bindingSyntaxFactory;
    }
    public onActivation(fn: (context: interfaces.Context, injectable: T) => T): interfaces.BindingWhenUnbindRebindSyntax<T> {
        return this._bindingSyntaxFactory.getBindingOn().onActivation(fn);
    }
    public unbind(): void {
        this._bindingSyntaxFactory.getUnbindRebind().unbind();
    }
    public rebind<T2 = T>() {
        return this._bindingSyntaxFactory.getUnbindRebind().rebind<T2>();
    }
}
