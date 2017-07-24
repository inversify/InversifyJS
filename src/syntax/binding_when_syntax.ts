import { interfaces } from "../interfaces/interfaces";
import { BindingOnSyntax } from "./binding_on_syntax";
import { traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint } from "./constraint_helpers";

class BindingWhenSyntax<T> implements interfaces.BindingWhenSyntax<T> {

    private _binding: interfaces.Binding<T>;

    public constructor(binding: interfaces.Binding<T>) {
        this._binding = binding;
    }

    public when(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = constraint;
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetNamed(name: string|number|symbol): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = namedConstraint(name);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetIsDefault(): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) => {

            let targetIsDefault = (request.target !== null) &&
                (request.target.isNamed() === false) &&
                (request.target.isTagged() === false);

            return targetIsDefault;
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetTagged(tag: string|number|symbol, value: any): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = taggedConstraint(tag)(value);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenInjectedInto(parent: (Function|string)): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = (request: interfaces.Request) => {
            return typeConstraint(parent)(request.parentRequest);
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentNamed(name: string|number|symbol): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = (request: interfaces.Request) => {
            return namedConstraint(name)(request.parentRequest);
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentTagged(tag: string|number|symbol, value: any): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = (request: interfaces.Request) => {
            return taggedConstraint(tag)(value)(request.parentRequest);
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorIs(ancestor: (Function|string)): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = (request: interfaces.Request) => {
            return traverseAncerstors(request, typeConstraint(ancestor));
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorIs(ancestor: (Function|string)): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = (request: interfaces.Request) => {
            return !traverseAncerstors(request, typeConstraint(ancestor));
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorNamed(name: string|number|symbol): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) => {
            return traverseAncerstors(request, namedConstraint(name));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorNamed(name: string|number|symbol): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) => {
            return !traverseAncerstors(request, namedConstraint(name));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorTagged(tag: string|number|symbol, value: any): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) => {
            return traverseAncerstors(request, taggedConstraint(tag)(value));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorTagged(tag: string|number|symbol, value: any): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) => {
            return !traverseAncerstors(request, taggedConstraint(tag)(value));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) => {
            return traverseAncerstors(request, constraint);
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) => {
            return !traverseAncerstors(request, constraint);
        };

        return new BindingOnSyntax<T>(this._binding);
    }

}

export { BindingWhenSyntax };
