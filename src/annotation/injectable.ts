///<reference path="../interfaces/interfaces.d.ts" />

import * as METADATA_KEY from "../constants/metadata_keys";
import * as ERRORS_MSGS from "../constants/error_msgs";
import { guid } from "../utils/utils";

function injectable(...paramTypes: string[]) {
  return function(target: any) {

    if (Reflect.hasOwnMetadata(METADATA_KEY.INJECTABLE, target) === true) {
      throw new Error(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
    }

    Reflect.defineMetadata(METADATA_KEY.INJECTABLE, paramTypes, target);
    Reflect.defineMetadata(METADATA_KEY.TYPE_ID, guid(), target);

    return target;
  };
}

export default injectable;
