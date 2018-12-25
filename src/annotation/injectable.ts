import * as ERRORS_MSGS from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";

let shouldIgnoreDuplicatedInjectableDecorators = false;

function ignoreDuplicatedInjectableDecorators(ignore?: boolean) {
    if (ignore !== undefined) {
        shouldIgnoreDuplicatedInjectableDecorators = ignore;
    }

    return shouldIgnoreDuplicatedInjectableDecorators;
}

function injectable() {
    return function(target: any) {

        if (Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, target)) {
            if (!ignoreDuplicatedInjectableDecorators()) {
                throw new Error(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
            }
            return target;
        }

        const types = Reflect.getMetadata(METADATA_KEY.DESIGN_PARAM_TYPES, target) || [];
        Reflect.defineMetadata(METADATA_KEY.PARAM_TYPES, types, target);

        return target;
    };
}

export { injectable, ignoreDuplicatedInjectableDecorators };
