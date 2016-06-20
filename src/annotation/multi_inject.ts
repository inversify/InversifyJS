import Metadata from "../planning/metadata";
import { tagParameter } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

function multiInject(serviceIdentifier: (string|Symbol)) {
  return function(target: any, targetKey: string, index: number) {
    let metadata = new Metadata(METADATA_KEY.MULTI_INJECT_TAG, serviceIdentifier);
    return tagParameter(target, targetKey, index, metadata);
  };
}

export default multiInject;
