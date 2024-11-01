import * as METADATA_KEY from '../constants/metadata_keys';
import { DecoratorTarget } from './decorator_utils';
import { injectBase } from './inject_base';
import { ServiceIdentifierOrFunc } from './lazy_service_identifier';

const multiInject: <T = unknown>(
  serviceIdentifier: ServiceIdentifierOrFunc<T>,
) => (
  target: DecoratorTarget,
  targetKey?: string | symbol,
  indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<T>,
) => void = injectBase(METADATA_KEY.MULTI_INJECT_TAG);

export { multiInject };
