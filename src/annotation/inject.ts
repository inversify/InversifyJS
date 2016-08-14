import Metadata from "../planning/metadata";
import { tagParameter, tagProperty } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

// Used to declare types to be injected not available at runtime
function inject(serviceIdentifier: (string|Symbol)) {
  return function(target: any, targetKey: string, index?: number) {

    let metadata = new Metadata(METADATA_KEY.INJECT_TAG, serviceIdentifier);

    if (typeof index === "number") {
      return tagParameter(target, targetKey, index, metadata);
    } else {
      return tagProperty(target, targetKey, metadata);
    }

  };
}

export default inject;
