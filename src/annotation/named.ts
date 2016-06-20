import Metadata from "../planning/metadata";
import { tagParameter, tagProperty } from "./decorator_utils";
import * as METADATA_KEY from "../constants/metadata_keys";

// Used to add named metadata which is used to resolve name-based contextual bindings.
function named(name: string) {
    return function(target: any, targetKey: string, index?: number) {
        let metadata = new Metadata(METADATA_KEY.NAMED_TAG, name);
        if (typeof index === "number") {
            return tagParameter(target, targetKey, index, metadata);
        } else {
            return tagProperty(target, targetKey, metadata);
        }
    };
}

export default named;
