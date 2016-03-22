///<reference path="../interfaces/interfaces.d.ts" />

import Metadata from "../planning/metadata";
import BindingOnSyntax from "./binding_on_syntax";
import * as METADATA_KEY from "../constants/metadata_keys";

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
        this._binding.constraint = (request: IRequest) => {
            return request.target.matchesName(name);
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetTagged(tag: string, value: any): IBindingOnSyntax<T> {
        this._binding.constraint = (request: IRequest) => {
            let metadata = new Metadata(tag, value);
            return request.target.matchesTag(metadata);
        };
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenInjectedInto(parent: (Function|string)): IBindingOnSyntax<T> {
        if (typeof parent === "string") {
            this._binding.constraint = (request: IRequest) => {
                return request.parentRequest.target.service.equals(parent); // TODO root request mast have a target & handle arrays
            };
        } else {
            this._binding.constraint = (request: IRequest) => {

                // Using index 0 because constraints are applied to one binding at a time
                let actualInjectedIntoSymbol = Reflect.getMetadata(METADATA_KEY.TYPE_ID, parent);
                let expectedIntoSymbol = Reflect.getMetadata(METADATA_KEY.TYPE_ID, request.parentRequest.bindings[0].implementationType);
                return actualInjectedIntoSymbol === expectedIntoSymbol;
            };
        }
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentNamed(name: string): IBindingOnSyntax<T> {
        // TODO
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentTagged(tag: string, value: any): IBindingOnSyntax<T> {
        // TODO
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorNamed(name: string): IBindingOnSyntax<T> {
        // TODO
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorTagged(tag: string, value: any): IBindingOnSyntax<T> {
        // TODO
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorNamed(name: string): IBindingOnSyntax<T> {
        // TODO
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorTagged(tag: string, value: any): IBindingOnSyntax<T> {
        // TODO
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T> {
        // TODO
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorMatches(constraint: (request: IRequest) => boolean): IBindingOnSyntax<T> {
        // TODO
        return new BindingOnSyntax<T>(this._binding);
    }

}

export default BindingWhenSyntax;
