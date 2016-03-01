///<reference path="../interfaces/interfaces.d.ts" />

import * as METADATA_KEY from "../constants/metadata_keys";
import * as ERRORS_MSGS from "../constants/error_msgs";

function Inject(...paramTypes: string[]) {
  return function(target: any) {

    if (Reflect.hasOwnMetadata(METADATA_KEY.INJECT, target) === true) {
      throw new Error(ERRORS_MSGS.DUPLICATED_INJECT_DECORATOR);
    }

    Reflect.defineMetadata(METADATA_KEY.INJECT, paramTypes, target);

    return target;
  };
}

export { Inject };
