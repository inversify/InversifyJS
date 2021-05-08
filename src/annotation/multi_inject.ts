import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";
import { createTaggedDecorator } from "./decorator_utils";

function multiInject(serviceIdentifier: interfaces.ServiceIdentifier<any>) {
  return createTaggedDecorator(new Metadata(METADATA_KEY.MULTI_INJECT_TAG, serviceIdentifier));
}

export { multiInject };
