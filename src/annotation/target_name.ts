import * as METADATA_KEY from '../constants/metadata_keys';
import { Metadata } from '../planning/metadata';
import { DecoratorTarget, tagParameter } from './decorator_utils';

function targetName(name: string) {
  return function (
    target: DecoratorTarget,
    targetKey: string | undefined,
    index: number,
  ) {
    const metadata: Metadata = new Metadata(METADATA_KEY.NAME_TAG, name);
    tagParameter(target, targetKey, index, metadata);
  };
}

export { targetName };
