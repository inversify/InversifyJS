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

const taggedConstraint = (key: string | number | symbol) => (value: unknown) => {

  const constraint: interfaces.ConstraintFunction = (request: interfaces.Request | null) =>
    request !== null && request.target !== null && request.target.matchesTag(key)(value);

  constraint.metaData = new Metadata(key, value);

  return constraint;
};

const namedConstraint = taggedConstraint(METADATA_KEY.NAMED_TAG);

const typeConstraint = (type: interfaces.Ancestor) => (request: interfaces.Request | null) => {

  // Using index 0 because constraints are applied
  // to one binding at a time (see Planner class)
  let binding: interfaces.Binding<unknown> | null = null;

  if (request !== null) {
    binding = request.bindings[0] as interfaces.Binding<unknown>;
    if (typeof type === "string") {
      const serviceIdentifier = binding.serviceIdentifier;
      return serviceIdentifier === type;
    } else {
      const constructor = (request.bindings[0] as interfaces.Binding<unknown>).implementationType;
      return type === constructor;
    }
  }

  return false;
};

/**
 * Creates a constraint building function for either permitting and disallowing constraints.
 * Specifying a value for `toBeConstrained` will restrict the type of function that can be used for `constraintFn`.
 *
 * @param willBePermitting Whether the constraint builder function will be one which returns a permitting constraint.
 */
const simpleConstraintBuilderBy =
  (willBePermitting: boolean) =>
  <TConstrained extends string | number | symbol | interfaces.Ancestor>(
    toBeConstrained: TConstrained,
    constraintFn: (toBeConstrained: TConstrained) => (request: interfaces.Request | null) => boolean
  ) =>
  (request: interfaces.Request | null) =>
    request !== null &&
    (() => {
      const constraintConditionHasBeenMet = traverseAncerstors(request, constraintFn(toBeConstrained));
      return willBePermitting ? constraintConditionHasBeenMet : !constraintConditionHasBeenMet;
    })();

/**
 * Builds a constraint which is an allowance (AT LEAST ONE ancestors MUST follow this condition).
 */
const buildSimpleAllowConstraint = simpleConstraintBuilderBy(true);

/**
 * Builds a constrint which is a disallowance (EVERY ancestor MUST NOT follow this condition).
 */
const buildSimpleDisallowConstraint = simpleConstraintBuilderBy(false);

export { traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint, buildSimpleAllowConstraint, buildSimpleDisallowConstraint };
