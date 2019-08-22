import * as ERRORS_MSGS from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import { Metadata } from "../planning/metadata";

function preDestroy() {
  return function (target: any, propertyKey: string) {
    const metadata = new Metadata(METADATA_KEY.PRE_DESTROY, propertyKey);

    if (Reflect.hasOwnMetadata(METADATA_KEY.PRE_DESTROY, target.constructor)) {
      throw new Error(ERRORS_MSGS.MULTIPLE_PRE_DESTROY_METHODS);
    }
    Reflect.defineMetadata(METADATA_KEY.PRE_DESTROY, metadata, target.constructor);
  };
}

export { preDestroy };
