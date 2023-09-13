import * as METADATA_KEY from '../constants/metadata_keys';
import { injectBase } from './inject_base';

const multiInject = injectBase(METADATA_KEY.MULTI_INJECT_TAG);

export { multiInject };
