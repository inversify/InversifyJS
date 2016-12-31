import { Metadata } from "../planning/metadata";
import { tagParameter } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

function targetName(name: string) {
  return function(target: any, targetKey: string, index: number) {
    let metadata = new Metadata(METADATA_KEY.NAME_TAG, name);
    tagParameter(target, targetKey, index, metadata);
  };
}

export { targetName };
