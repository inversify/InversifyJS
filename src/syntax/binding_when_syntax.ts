///<reference path="../interfaces/interfaces.d.ts" />

import Metadata from "../planning/metadata";
import BindingOnSyntax from "./binding_on_syntax";
import * as METADATA_KEY from "../constants/metadata_keys";

// This helpers use function partial application to 
// generate constraints and reduce amount of code
let ancestorRecursiveIterator = (request: IRequest, constraint: (request: IRequest) => boolean): boolean => {
    let parent = request.parentRequest;
    if (parent !== null) {
        return constraint(parent) ? true : ancestorRecursiveIterator(parent, constraint);
    } else {
        return false;
    }
};

let namedConstraint = (name: string) => {
    return (request: IRequest) => {
        return request.target.matchesName(name);
    };
};

let taggedConstraint = (tag: string, value: any) => {
    return (request: IRequest) => {
        let metadata = new Metadata(tag, value);
        return request.target.matchesTag(metadata);
    };
};

let typeConstraint = (type: (Function|string)) => {

    if (typeof parent === "string") {
        return (request: IRequest) => {

            // Using index 0 because constraints are applied 
            // to one binding at a time (see Planner class)
            let binding = request.bindings[0];
            let runtimeIdentifier = binding.runtimeIdentifier;
            return runtimeIdentifier === type;
        };
    } else {
        return (request: IRequest) => {

            // See preceding comment
            let constructor = request.bindings[0].implementationType;
            let actualInjectedIntoSymbol = Reflect.getMetadata(METADATA_KEY.TYPE_ID, type);
            let expectedIntoSymbol = Reflect.getMetadata(METADATA_KEY.TYPE_ID, constructor);
            return actualInjectedIntoSymbol === expectedIntoSymbol;
        };
    }
};



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
        this._binding.constraint = taggedConstraint(tag, value);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenInjectedInto(parent: (Function|string)): IBindingOnSyntax<T> {
        this._binding.constraint = typeConstraint(parent);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentNamed(name: string): IBindingOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return request.parentRequest.target.matchesName(name);
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentTagged(tag: string, value: any): IBindingOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return request.parentRequest.target.matchesTag(new Metadata(tag, value));
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorIs(ancestor: (Function|string)): IBindingOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return ancestorRecursiveIterator(request, typeConstraint(ancestor));
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorIs(ancestor: (Function|string)): IBindingOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            return !ancestorRecursiveIterator(request, typeConstraint(ancestor));
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorNamed(name: string): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return ancestorRecursiveIterator(request, namedConstraint(name));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorTagged(tag: string, value: any): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return ancestorRecursiveIterator(request, taggedConstraint(tag, name));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorNamed(name: string): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return !ancestorRecursiveIterator(request, namedConstraint(name));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorTagged(tag: string, value: any): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return !ancestorRecursiveIterator(request, taggedConstraint(tag, name));
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return ancestorRecursiveIterator(request, constraint);
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T> {

        this._binding.constraint = (request: IRequest) => {
            return !ancestorRecursiveIterator(request, constraint);
        };

        return new BindingOnSyntax<T>(this._binding);
    }

}

export default BindingWhenSyntax;
