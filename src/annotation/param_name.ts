///<reference path="../interfaces/interfaces.d.ts" />

import Metadata from "../planning/metadata";
import { tagParameter, tagProperty } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

function targetName(name: string) {
  return function(target: any, targetKey: string, index?: number) {
    let metadata = new Metadata(METADATA_KEY.NAME_TAG, name);
    if (typeof index === "number") {
      return tagParameter(target, targetKey, index, metadata);
    } else {
      return tagProperty(target, targetKey, metadata);
    }
  };
}

export default targetName;
