import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";
import * as METADATA_KEY from "../constants/metadata_keys";

let traverseAncerstors = (
    request: interfaces.Request,
    constraint: interfaces.ConstraintFunction
): boolean => {

    let parent = request.parentRequest;
    if (parent !== null) {
        return constraint(parent) ? true : traverseAncerstors(parent, constraint);
    } else {
        return false;
    }
};

// This helpers use currying to help you to generate constraints

let taggedConstraint = (key: string|number|symbol) => (value: any) => {

    let constraint: interfaces.ConstraintFunction =  (request: interfaces.Request | null) =>  {
        return request !== null && request.target !== null && request.target.matchesTag(key)(value);
    };

    constraint.metaData = new Metadata(key, value);

    return constraint;
};

let namedConstraint = taggedConstraint(METADATA_KEY.NAMED_TAG);

let typeConstraint = (type: (Function | string)) => (request: interfaces.Request | null) => {

    // Using index 0 because constraints are applied
    // to one binding at a time (see Planner class)
    let binding: interfaces.Binding<any> | null = null;

    if (request !== null) {
        binding = request.bindings[0];
        if (typeof type === "string") {
            let serviceIdentifier = binding.serviceIdentifier;
            return serviceIdentifier === type;
        } else {
            let constructor = request.bindings[0].implementationType;
            return type === constructor;
        }
    }

    return false;
};

export { traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint };
