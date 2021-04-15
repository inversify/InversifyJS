import * as METADATA_KEY from "../constants/metadata_keys";
import { Metadata } from "../planning/metadata";
import { tagParameter, tagProperty } from "./decorator_utils";

// Used to add named metadata which is used to resolve name-based contextual bindings.
function named(name: string | number | symbol) {
    return function(target: any, targetKey: string | symbol, index?: number) {
        const metadata = new Metadata(METADATA_KEY.NAMED_TAG, name);
        if (typeof index === "number") {
            tagParameter(target, targetKey, index, metadata);
        } else {
            tagProperty(target, targetKey, metadata);
        }
    };
}

export { named };
