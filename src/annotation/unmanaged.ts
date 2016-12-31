import { Metadata } from "../planning/metadata";
import { tagParameter } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

function unmanaged() {
    return function(target: any, targetKey: string, index: number) {
        let metadata = new Metadata(METADATA_KEY.UNMANAGED_TAG, true);
        tagParameter(target, targetKey, index, metadata);
    };
}

export { unmanaged };
