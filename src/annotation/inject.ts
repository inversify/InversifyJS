///<reference path="../interfaces/interfaces.d.ts" />

import Metadata from "../planning/metadata";
import { tagParameter } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

function inject(name: (string|Symbol)) {
  return function(target: any, targetKey: string, index: number) {
    let metadata = new Metadata(METADATA_KEY.NAMED_TAG, name); // TODO
    return tagParameter(target, targetKey, index, metadata); // TODO
  };
}

export default inject;
