///<reference path="../interfaces/interfaces.d.ts" />

import BindingOnSyntax from "./binding_on_syntax";
import { traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint } from "./constraint_helpers";

class BindingWhenSyntax<T> implements IBindingWhenSyntax<T> {

    private _binding: IBinding<T>;

    public constructor(binding: IBinding<T>) {
        this._binding = binding;
    }

    public when(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T> {
        this._binding.constraint = constraint;
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetNamed(name: string): IBindingOnSyntax<T> {
        this._binding.constraint = namedConstraint(name);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetTagged(tag: string, value: any): IBindingOnSyntax<T> {
        this._binding.constraint = taggedConstraint(tag)(value);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenInjectedInto(parent: (Function|string)): IBindingOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return typeConstraint(parent)(request.parentRequest);
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentNamed(name: string): IBindingOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return namedConstraint(name)(request.parentRequest);
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentTagged(tag: string, value: any): IBindingOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return taggedConstraint(tag)(value)(request.parentRequest);
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorIs(ancestor: (Function|string)): IBindingOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return traverseAncerstors(request, typeConstraint(ancestor));
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorIs(ancestor: (Function|string)): IBindingOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return !traverseAncerstors(request, typeConstraint(ancestor));
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorNamed(name: string): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return traverseAncerstors(request, namedConstraint(name));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorTagged(tag: string, value: any): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return traverseAncerstors(request, taggedConstraint(tag)(name));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorNamed(name: string): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return !traverseAncerstors(request, namedConstraint(name));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorTagged(tag: string, value: any): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return !traverseAncerstors(request, taggedConstraint(tag)(name));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return traverseAncerstors(request, constraint);
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return !traverseAncerstors(request, constraint);
        };

        return new BindingOnSyntax<T>(this._binding);
    }

}

export default BindingWhenSyntax;
