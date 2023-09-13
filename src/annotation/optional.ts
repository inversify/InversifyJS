import * as METADATA_KEY from '../constants/metadata_keys';
import { Metadata } from '../planning/metadata';
import { createTaggedDecorator } from './decorator_utils';

function optional() {
  return createTaggedDecorator(new Metadata(METADATA_KEY.OPTIONAL_TAG, true));
}

export { optional };
