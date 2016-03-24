///<reference path="../interfaces/interfaces.d.ts" />

import * as METADATA_KEY from "../constants/metadata_keys";
import * as ERRORS_MSGS from "../constants/error_msgs";

function injectable(...paramTypes: (string|Symbol|any)[]) {
  return function(target: any) {

    if (Reflect.hasOwnMetadata(METADATA_KEY.INJECTABLE, target) === true) {
      throw new Error(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
    }

    Reflect.defineMetadata(METADATA_KEY.INJECTABLE, paramTypes, target);

    return target;
  };
}

export default injectable;
