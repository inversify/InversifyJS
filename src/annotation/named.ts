import { NAMED_TAG } from '../constants/metadata_keys';
import { Metadata } from '../planning/metadata';
import { tagParameter, tagProperty } from './decorator_utils';


// Used to add named metadata which is used to resolve name-based contextual bindings.
function named(name: string | number | symbol) {
  return function (
    target: NewableFunction,
    targetKey: string,
    index?: number
  ): void {
    const metadata = new Metadata(NAMED_TAG, name);
    if (typeof index === 'number') {
      tagParameter(target, targetKey, index, metadata);
    } else {
      tagProperty(target, targetKey, metadata);
    }
  };
}

export { named };
