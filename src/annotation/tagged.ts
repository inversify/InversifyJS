import { Metadata } from "../planning/metadata";
import { createTaggedDecoratorInternal } from "./decorator_utils";

// Used to add custom metadata which is used to resolve metadata-based contextual bindings.
function tagged(metadataKey: string | number | symbol, metadataValue: any) {
    return createTaggedDecoratorInternal(new Metadata(metadataKey, metadataValue));
}

export { tagged };
