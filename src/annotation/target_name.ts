import * as METADATA_KEY from '../constants/metadata_keys';
import { Metadata } from '../planning/metadata';
import { tagParameter } from './decorator_utils';

function targetName(name: string) {
  return function (target: NewableFunction, targetKey: string, index: number): void {
    const metadata = new Metadata(METADATA_KEY.NAME_TAG, name);
    tagParameter(target, targetKey, index, metadata);
  };
}

export { targetName };
