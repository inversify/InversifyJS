import * as METADATA_KEY from '../constants/metadata_keys';
import { interfaces } from '../interfaces/interfaces';
import { Metadata } from '../planning/metadata';

const traverseAncerstors: (
  request: interfaces.Request,
  constraint: interfaces.ConstraintFunction,
) => boolean = (
  request: interfaces.Request,
  constraint: interfaces.ConstraintFunction,
): boolean => {
  const parent: interfaces.Request | null = request.parentRequest;
  if (parent !== null) {
    return constraint(parent) ? true : traverseAncerstors(parent, constraint);
  } else {
    return false;
  }
};

// This helpers use currying to help you to generate constraints

const taggedConstraint: (
  key: string | number | symbol,
) => (value: unknown) => interfaces.ConstraintFunction =
  (key: string | number | symbol) => (value: unknown) => {
    const constraint: interfaces.ConstraintFunction = (
      request: interfaces.Request | null,
    ) =>
      request !== null &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      request.target !== null &&
      request.target.matchesTag(key)(value);

    constraint.metaData = new Metadata(key, value);

    return constraint;
  };

const namedConstraint: (value: unknown) => interfaces.ConstraintFunction =
  taggedConstraint(METADATA_KEY.NAMED_TAG);

const typeConstraint: (
  type: NewableFunction | string,
) => (request: interfaces.Request | null) => boolean =
  (type: NewableFunction | string) => (request: interfaces.Request | null) => {
    // Using index 0 because constraints are applied
    // to one binding at a time (see Planner class)
    let binding: interfaces.Binding<unknown> | null = null;

    if (request !== null) {
      binding = request.bindings[0] as interfaces.Binding<unknown>;
      if (typeof type === 'string') {
        return binding.serviceIdentifier === type;
      } else {
        const constructor: unknown = (
          request.bindings[0] as interfaces.Binding<unknown>
        ).implementationType;
        return type === constructor;
      }
    }

    return false;
  };

export {
  traverseAncerstors,
  taggedConstraint,
  namedConstraint,
  typeConstraint,
};
