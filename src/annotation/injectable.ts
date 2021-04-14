import { DESIGN_PARAM_TYPES, PARAM_TYPES } from '../constants/metadata_keys';
import { DUPLICATED_INJECTABLE_DECORATOR } from '../constants/error_msgs';


function injectable(): ClassDecorator {
  return (target) => {
    if (Reflect.hasOwnMetadata(PARAM_TYPES, target)) {
      throw new Error(DUPLICATED_INJECTABLE_DECORATOR);
    }

    const types = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) as unknown;
    Reflect.defineMetadata(PARAM_TYPES, types, target);

    return target;
  };
}

export { injectable };
