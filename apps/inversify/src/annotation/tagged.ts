import { Metadata } from '../planning/metadata';
import { createTaggedDecorator } from './decorator_utils';

// Used to add custom metadata which is used to resolve metadata-based contextual bindings.
function tagged<T>(metadataKey: string | number | symbol, metadataValue: unknown) {
  return createTaggedDecorator(new Metadata(metadataKey, metadataValue));
}

export { tagged };
