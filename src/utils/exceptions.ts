import * as ERROR_MSGS from '../constants/error_msgs';

export function isStackOverflowException(error: unknown): error is RangeError {
  return (
    error instanceof RangeError ||
    (error as Error).message === ERROR_MSGS.STACK_OVERFLOW
  );
}

export const tryAndThrowErrorIfStackOverflow: <T>(
  fn: () => T,
  errorCallback: () => Error,
) => T = <T>(fn: () => T, errorCallback: () => Error) => {
  try {
    return fn();
  } catch (error: unknown) {
    if (isStackOverflowException(error)) {
      throw errorCallback();
    }

    throw error;
  }
};
