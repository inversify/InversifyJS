import Metadata from "../planning/metadata";
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

let taggedConstraint = (tag: string) => (value: any) => (request: IRequest) => {
    let metadata = new Metadata(tag, value);
    return request.target.matchesTag(metadata);
};

let namedConstraint = taggedConstraint(METADATA_KEY.NAMED_TAG);

let typeConstraint = (type: (Function|string)) => (request: IRequest) => {

    // Using index 0 because constraints are applied 
    // to one binding at a time (see Planner class)
    let binding = request.bindings[0];

    if (typeof type === "string") {
        let runtimeIdentifier = binding.runtimeIdentifier;
        return runtimeIdentifier === type;
    } else {
        let constructor = request.bindings[0].implementationType;
        return type === constructor;
    }
};

export { traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint };
