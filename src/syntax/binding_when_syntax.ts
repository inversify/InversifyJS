import { interfaces } from "../interfaces/interfaces";
import { BindingOnSyntax } from "./binding_on_syntax";
import { namedConstraint, notConstraint, orConstraint, taggedConstraint, traverseAncerstors, typeConstraint } from "./constraint_helpers";

class BindingWhenSyntax<T> implements interfaces.BindingWhenSyntax<T> {

    private _binding: interfaces.Binding<T>;

    private whenAnyAncestorIsConstraint(ancestor: (Function | string | symbol)  | (Function | string | symbol)[]) {
        let constraint: interfaces.ConstraintFunction;
        if (Array.isArray(ancestor)) {
            constraint = orConstraint(
                ...ancestor.map((a) => (request: interfaces.Request) => traverseAncerstors(request, typeConstraint(a)))
            );
        } else {
            constraint = (request: interfaces.Request) =>
            traverseAncerstors(request, typeConstraint(ancestor));
        }
        return constraint;
    }

    public constructor(binding: interfaces.Binding<T>) {
        this._binding = binding;
    }

    public when(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = constraint;
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetNamed(name: string | number | symbol): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = namedConstraint(name);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetIsDefault(): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) => {

            const targetIsDefault = (request.target !== null) &&
                (!request.target.isNamed()) &&
                (!request.target.isTagged());

            return targetIsDefault;
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetTagged(tag: string | number | symbol, value: any): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = taggedConstraint(tag)(value);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenInjectedInto(parent: (Function | string | symbol) | (Function | string | symbol)[]): interfaces.BindingOnSyntax<T> {
        if (Array.isArray(parent)) {
            this._binding.constraint = orConstraint(
                ...parent.map((p) => (request: interfaces.Request) => typeConstraint(p)(request.parentRequest))
            );
        } else {
            this._binding.constraint = (request: interfaces.Request) =>
            typeConstraint(parent)(request.parentRequest);
        }
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentNamed(name: string | number | symbol): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = (request: interfaces.Request) =>
            namedConstraint(name)(request.parentRequest);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentTagged(tag: string | number | symbol, value: any): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = (request: interfaces.Request) =>
            taggedConstraint(tag)(value)(request.parentRequest);
        return new BindingOnSyntax<T>(this._binding);
    }
    public whenAnyAncestorIs(ancestor: (Function | string | symbol)  | (Function | string | symbol)[]): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = this.whenAnyAncestorIsConstraint(ancestor);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorIs(ancestor: (Function | string | symbol)  | (Function | string | symbol)[]): interfaces.BindingOnSyntax<T> {
        this._binding.constraint = notConstraint(this.whenAnyAncestorIsConstraint(ancestor));
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorNamed(name: string | number | symbol): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) =>
            traverseAncerstors(request, namedConstraint(name));

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorNamed(name: string | number | symbol): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) =>
            !traverseAncerstors(request, namedConstraint(name));

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorTagged(tag: string | number | symbol, value: any): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) =>
            traverseAncerstors(request, taggedConstraint(tag)(value));

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorTagged(tag: string | number | symbol, value: any): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) =>
            !traverseAncerstors(request, taggedConstraint(tag)(value));

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) =>
            traverseAncerstors(request, constraint);

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T> {

        this._binding.constraint = (request: interfaces.Request) =>
            !traverseAncerstors(request, constraint);

        return new BindingOnSyntax<T>(this._binding);
    }

}

export { BindingWhenSyntax };
