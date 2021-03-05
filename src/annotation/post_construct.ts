import * as ERRORS_MSGS from '../constants/error_msgs';
import * as METADATA_KEY from '../constants/metadata_keys';
import { Metadata } from '../planning/metadata';

function postConstruct() {
	return function (target: Object, propertyKey: string) {
		const metadata = new Metadata(METADATA_KEY.POST_CONSTRUCT, propertyKey);

		if (Reflect.hasOwnMetadata(METADATA_KEY.POST_CONSTRUCT, target.constructor)) {
			throw new Error(ERRORS_MSGS.MULTIPLE_POST_CONSTRUCT_METHODS);
		}
		Reflect.defineMetadata(METADATA_KEY.POST_CONSTRUCT, metadata, target.constructor);
	};
}

export { postConstruct };
