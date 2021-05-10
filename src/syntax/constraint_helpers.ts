import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";

const traverseAncerstors = (
    request: interfaces.Request,
    constraint: interfaces.ConstraintFunction
): boolean => {

    const parent = request.parentRequest;
    if (parent !== null) {
        return constraint(parent) ? true : traverseAncerstors(parent, constraint);
    } else {
        return false;
    }
};

// This helpers use currying to help you to generate constraints

const taggedConstraint = (key: string | number | symbol) => (value: any) => {

    const constraint: interfaces.ConstraintFunction =  (request: interfaces.Request | null) =>
        request !== null && request.target !== null && request.target.matchesTag(key)(value);

    constraint.metaData = new Metadata(key, value);

    return constraint;
};

const namedConstraint = taggedConstraint(METADATA_KEY.NAMED_TAG);

const typeConstraint = (type: interfaces.ServiceIdentifier<any>) => (request: interfaces.Request | null) => {
    let match = false;

    if (request !== null) {
        // Using index 0 because constraints are applied
        // to one binding at a time (see Planner class)
        const binding = request.bindings[0];
        const serviceIdentifier = binding.serviceIdentifier;
        if (typeof type === "string") {
            match = serviceIdentifier === type;
        } else if (typeof type === "symbol") {
            match = typeof serviceIdentifier === "symbol" ? symbolMatch(serviceIdentifier, type) : false;
        } else {
            const constructor = binding.implementationType;
            if (type === constructor) {
                match = true;
            } else {
                // Abstract<T>
                match = (type as any).isPrototypeOf(constructor);
            }
        }
    }

    return match;
};

const symbolMatch = (serviceIdentifier: symbol, matchSymbol: symbol): boolean => {
    if (serviceIdentifier === matchSymbol) {
        return serviceIdentifier === matchSymbol;
    }
    const matchOnSymbolKey = false;
    if (matchOnSymbolKey) {
        return Symbol.keyFor(serviceIdentifier) === Symbol.keyFor(matchSymbol);
    }
    return false;
};

const notConstraint = (constraint: interfaces.ConstraintFunction) => {
    const not: interfaces.ConstraintFunction =  (request: interfaces.Request | null) => {
        return !constraint(request);
    };
    return not;
};
const andConstraint = (...constraints: interfaces.ConstraintFunction[]) => {
    const and: interfaces.ConstraintFunction =  (request: interfaces.Request | null) => {
        let passed = true;
        for (const constraint of constraints) {
            passed = constraint(request);
            if (!passed) {
                break;
            }
        }
        return passed;
    };
    return and;
};
const orConstraint = (...constraints: interfaces.ConstraintFunction[]) => {
    const or: interfaces.ConstraintFunction =  (request: interfaces.Request | null) => {
        let passed = false;
        for (const constraint of constraints) {
            passed = constraint(request);
            if (passed) {
                break;
            }
        }
        return passed;
    };
    return or;
};

export { traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint, notConstraint, andConstraint, orConstraint };
