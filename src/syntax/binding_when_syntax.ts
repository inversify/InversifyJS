import { interfaces } from "../interfaces/interfaces";
import { namedConstraint, taggedConstraint, traverseAncerstors, typeConstraint } from "./constraint_helpers";

class BindingWhenSyntax<T> implements interfaces.BindingWhenSyntax<T> {

    private _binding: interfaces.Binding<T>;
    private _bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>;
    public constructor(binding: interfaces.Binding<T>, bindingSyntaxFactory: interfaces.BindingSyntaxFactory<T>) {
        this._binding = binding;
        this._bindingSyntaxFactory = bindingSyntaxFactory;
    }

    public when(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint(constraint);
    }

    public whenTargetNamed(name: string | number | symbol): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint(namedConstraint(name));
    }

    public whenTargetIsDefault(): interfaces.BindingOnUnbindRebindSyntax<T> {

        return this.setConstraint((request: interfaces.Request) => {

            const targetIsDefault = (request.target !== null) &&
                (!request.target.isNamed()) &&
                (!request.target.isTagged());

            return targetIsDefault;
        });
    }

    public whenTargetTagged(tag: string | number | symbol, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint(taggedConstraint(tag)(value));
    }

    public whenInjectedInto(parent: (Function | string)): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint((request: interfaces.Request) =>
            typeConstraint(parent)(request.parentRequest));
    }

    public whenParentNamed(name: string | number | symbol): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint((request: interfaces.Request) =>
            namedConstraint(name)(request.parentRequest));
    }

    public whenParentTagged(tag: string | number | symbol, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint((request: interfaces.Request) =>
            taggedConstraint(tag)(value)(request.parentRequest));
    }

    public whenAnyAncestorIs(ancestor: (Function | string)): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint((request: interfaces.Request) =>
            traverseAncerstors(request, typeConstraint(ancestor)));
    }

    public whenNoAncestorIs(ancestor: (Function | string)): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint((request: interfaces.Request) =>
            !traverseAncerstors(request, typeConstraint(ancestor)));
    }

    public whenAnyAncestorNamed(name: string | number | symbol): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint((request: interfaces.Request) =>
            traverseAncerstors(request, namedConstraint(name)));
    }

    public whenNoAncestorNamed(name: string | number | symbol): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint((request: interfaces.Request) =>
            !traverseAncerstors(request, namedConstraint(name)));
    }

    public whenAnyAncestorTagged(tag: string | number | symbol, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint((request: interfaces.Request) =>
            traverseAncerstors(request, taggedConstraint(tag)(value)));
    }

    public whenNoAncestorTagged(tag: string | number | symbol, value: any): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint((request: interfaces.Request) =>
            !traverseAncerstors(request, taggedConstraint(tag)(value)));
    }

    public whenAnyAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint((request: interfaces.Request) =>
            traverseAncerstors(request, constraint));
    }

    public whenNoAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnUnbindRebindSyntax<T> {
        return this.setConstraint((request: interfaces.Request) =>
            !traverseAncerstors(request, constraint));
    }
    private setConstraint(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnUnbindRebindSyntax<T> {
        this._binding.constraint = constraint;
        return this._bindingSyntaxFactory.getBindingOnUnbindRebind();
    }
}

export { BindingWhenSyntax };
