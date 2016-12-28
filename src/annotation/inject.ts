import { Metadata } from "../planning/metadata";
import { interfaces } from "../interfaces/interfaces";
import { tagParameter, tagProperty } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

function inject(serviceIdentifier: interfaces.ServiceIdentifier<any>) {
  return function(target: any, targetKey: string, index?: number): void {

    let metadata = new Metadata(METADATA_KEY.INJECT_TAG, serviceIdentifier);

    if (typeof index === "number") {
      tagParameter(target, targetKey, index, metadata);
    } else {
      tagProperty(target, targetKey, metadata);
    }

  };
}

export { inject };
