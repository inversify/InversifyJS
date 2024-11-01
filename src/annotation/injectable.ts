import * as ERRORS_MSGS from '../constants/error_msgs';
import * as METADATA_KEY from '../constants/metadata_keys';

function injectable() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <T extends abstract new (...args: any) => unknown>(
    target: T,
  ) {
    if (Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, target)) {
      throw new Error(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
    }

    const types: NewableFunction[] =
      (Reflect.getMetadata(METADATA_KEY.DESIGN_PARAM_TYPES, target) as
        | NewableFunction[]
        | undefined) || [];
    Reflect.defineMetadata(METADATA_KEY.PARAM_TYPES, types, target);

    return target;
  };
}

export { injectable };
