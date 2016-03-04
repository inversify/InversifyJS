///<reference path="../interfaces/interfaces.d.ts" />

import * as ERROR_MSGS from "../constants/error_msgs";

class BindingWhenSyntax<T> implements IBindingWhenSyntax<T> {

    private _binding: IBinding<T>;

    public constructor(binding: IBinding<T>) {
        this._binding = binding;
    }

    public when(constraint: Constraint): void {
        throw new Error(`${ERROR_MSGS.NOT_IMPLEMENTED}`);
    }

}

export default BindingWhenSyntax;
