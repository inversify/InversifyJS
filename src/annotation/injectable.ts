import * as METADATA_KEY from "../constants/metadata_keys";
import * as ERRORS_MSGS from "../constants/error_msgs";

function injectable() {
  return function(target: any) {

    if (Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, target) === true) {
      throw new Error(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
    }

    let types = Reflect.getMetadata(METADATA_KEY.DESIGN_PARAM_TYPES, target) || [];
    Reflect.defineMetadata(METADATA_KEY.PARAM_TYPES, types, target);

    return target;
  };
}

export { injectable };
