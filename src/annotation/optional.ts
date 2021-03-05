import * as METADATA_KEY from '../constants/metadata_keys';
import { Metadata } from '../planning/metadata';
import { tagParameter, tagProperty } from './decorator_utils';

function optional() {
  return function (target: Object, targetKey: string, index?: number) {
    const metadata = new Metadata(METADATA_KEY.OPTIONAL_TAG, true);

    if (typeof index === 'number') {
      tagParameter(target, targetKey, index, metadata);
    } else {
      tagProperty(target, targetKey, metadata);
    }
  };
}

export { optional };
