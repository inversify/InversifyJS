///<reference path="../interfaces/interfaces.d.ts" />

import * as METADATA_KEY from "../constants/metadata_keys";

let traverseAncerstors = (request: IRequest, constraint: (request: IRequest) => boolean): boolean => {
    let parent = request.parentRequest;
    if (parent !== null) {
        return constraint(parent) ? true : traverseAncerstors(parent, constraint);
    } else {
        return false;
    }
};

// This helpers use currying to help you to generate constraints

let taggedConstraint = (key: string) => (value: any) => (request: IRequest) => {
    return request.target.matchesTag(key)(value);
};

let namedConstraint = taggedConstraint(METADATA_KEY.NAMED_TAG);

let typeConstraint = (type: (Function|string)) => (request: IRequest) => {

    // Using index 0 because constraints are applied 
    // to one binding at a time (see Planner class)
    let binding = request.bindings[0];

    if (typeof type === "string") {
        let serviceIdentifier = binding.serviceIdentifier;
        return serviceIdentifier === type;
    } else {
        let constructor = request.bindings[0].implementationType;
        return type === constructor;
    }
};

export { traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint };
