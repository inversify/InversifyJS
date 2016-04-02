///<reference path="../interfaces/interfaces.d.ts" />

import Metadata from "../planning/metadata";
import { tagParameter } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

// Used to declare types to be injected not available at runtime
function inject(name: (string|Symbol)) {
  return function(target: any, targetKey: string, index: number) {
    let metadata = new Metadata(METADATA_KEY.INJECT_TAG, name);
    return tagParameter(target, targetKey, index, metadata);
  };
}

export default inject;
