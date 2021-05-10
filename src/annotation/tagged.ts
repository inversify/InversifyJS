import { Metadata } from "../planning/metadata";
import { createTaggedDecorator } from "./decorator_utils";

// Used to add custom metadata which is used to resolve metadata-based contextual bindings.
function tagged(metadataKey: string | number | symbol, metadataValue: any) {
    return createTaggedDecorator(new Metadata(metadataKey, metadataValue));
}

export { tagged };
