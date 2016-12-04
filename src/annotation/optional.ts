import { Metadata } from "../planning/metadata";
import { tagParameter } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

function optional() {
    return function(target: any, targetKey: string, index: number) {
        let metadata = new Metadata(METADATA_KEY.OPTIONAL_TAG, true);
        return tagParameter(target, targetKey, index, metadata);
    };
}

export { optional };
