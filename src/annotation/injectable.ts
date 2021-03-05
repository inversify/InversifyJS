import * as ERRORS_MSGS from '../constants/error_msgs';
import * as METADATA_KEY from '../constants/metadata_keys';

function injectable() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (target: any) => {
		if (Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, target)) {
			throw new Error(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
		}

		const types = Reflect.getMetadata(METADATA_KEY.DESIGN_PARAM_TYPES, target) || [];
		Reflect.defineMetadata(METADATA_KEY.PARAM_TYPES, types, target);

		return target;
	};
}

export { injectable };
