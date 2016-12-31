import { Metadata } from "../planning/metadata";
import { interfaces } from "../interfaces/interfaces";
import { tagParameter, tagProperty } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

function multiInject(serviceIdentifier: interfaces.ServiceIdentifier<any>) {
  return function(target: any, targetKey: string, index?: number) {

    let metadata = new Metadata(METADATA_KEY.MULTI_INJECT_TAG, serviceIdentifier);

    if (typeof index === "number") {
      tagParameter(target, targetKey, index, metadata);
    } else {
      tagProperty(target, targetKey, metadata);
    }

  };
}

export { multiInject };
