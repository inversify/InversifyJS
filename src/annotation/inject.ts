import { Metadata } from "../planning/metadata";
import { interfaces } from "../interfaces/interfaces";
import { tagParameter, tagProperty } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

function inject(serviceIdentifier: interfaces.ServiceIdentifier<any>) {
  return function(target: any, targetKey: string, index?: number) {

    let metadata = new Metadata(METADATA_KEY.INJECT_TAG, serviceIdentifier);

    if (typeof index === "number") {
      return tagParameter(target, targetKey, index, metadata);
    } else {
      return tagProperty(target, targetKey, metadata);
    }

  };
}

export { inject };
