import { MULTI_INJECT_TAG } from '../constants/metadata_keys';
import { ServiceIdentifier } from '../interfaces/interfaces';
import { Metadata } from '../planning/metadata';
import { tagParameter, tagProperty } from './decorator_utils';


function multiInject(
  serviceIdentifier: ServiceIdentifier<NewableFunction>
) {
  return function (
    target: NewableFunction,
    targetKey: string,
    index?: number
  ): void {
    const metadata = new Metadata(
      MULTI_INJECT_TAG,
      serviceIdentifier
    );

    if (typeof index === 'number') {
      tagParameter(target, targetKey, index, metadata);
    } else {
      tagProperty(target, targetKey, metadata);
    }
  };
}

export { multiInject };
