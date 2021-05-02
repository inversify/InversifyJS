import * as ERROR_MSGS from "../constants/error_msgs";

export function isStackOverflowExeption(error: Error) {
    return (
        error instanceof RangeError ||
        error.message === ERROR_MSGS.STACK_OVERFLOW
    );
}

export const tryAndThrowErrorIfStackOverflow = <T>(fn: () => T, errorCallback: () => Error) => {
    try {
        return fn();
    } catch (error) {
        if (isStackOverflowExeption(error)) {
            error = errorCallback();
        }
        throw error;
    }
}
