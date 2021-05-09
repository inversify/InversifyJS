import * as METADATA_KEY from "../constants/metadata_keys";
import { Metadata } from "../planning/metadata";
import { createTaggedDecoratorInternal } from "./decorator_utils";

// Used to add named metadata which is used to resolve name-based contextual bindings.
function named(name: string | number | symbol) {
    return createTaggedDecoratorInternal(new Metadata(METADATA_KEY.NAMED_TAG, name));
}

export { named };
