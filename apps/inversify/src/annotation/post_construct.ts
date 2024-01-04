import * as ERRORS_MSGS from '../constants/error_msgs';
import * as METADATA_KEY from '../constants/metadata_keys';
import { propertyEventDecorator } from './property_event_decorator';

const postConstruct = propertyEventDecorator(
  METADATA_KEY.POST_CONSTRUCT,
  ERRORS_MSGS.MULTIPLE_POST_CONSTRUCT_METHODS,
);

export { postConstruct };
