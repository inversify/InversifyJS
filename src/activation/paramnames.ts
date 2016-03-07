///<reference path="../interfaces/interfaces.d.ts" />

import * as METADATA_KEY from "../constants/metadata_keys";
import * as ERRORS_MSGS from "../constants/error_msgs";

function paramNames(...names: string[]) {
  return function(target: any) {

    if (Reflect.hasOwnMetadata(METADATA_KEY.PARAM_NAMES, target) === true) {
      throw new Error(ERRORS_MSGS.DUPLICATED_PARAM_NAMES_DECORATOR);
    }

    Reflect.defineMetadata(METADATA_KEY.PARAM_NAMES, names, target);

    return target;
  };
}

export default paramNames;
