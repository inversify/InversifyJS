import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";
import { tagParameter, tagProperty } from "./decorator_utils";

function inject(serviceIdentifier: interfaces.ServiceIdentifier<any>) {
  return function(target: any, targetKey: string, index?: number): void {

    const metadata = new Metadata(METADATA_KEY.INJECT_TAG, serviceIdentifier);

    if (typeof index === "number") {
      tagParameter(target, targetKey, index, metadata);
    } else {
      tagProperty(target, targetKey, metadata);
    }

  };
}

export { inject };
