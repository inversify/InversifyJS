///<reference path="../interfaces/interfaces.d.ts" />

import Metadata from "../planning/metadata";
import { tagParameter, tagProperty } from "./decorator_utils";

// Used to add custom metadata which is used to resolve metadata-based contextual bindings.
function tagged(metadataKey: string, metadataValue: any) {
    return function(target: any, targetKey: string, index?: number) {
        let metadata = new Metadata(metadataKey, metadataValue);
            if (typeof index === "number") {
        return tagParameter(target, targetKey, index, metadata);
        } else {
            return tagProperty(target, targetKey, metadata);
        }
    };
}

export default tagged;
