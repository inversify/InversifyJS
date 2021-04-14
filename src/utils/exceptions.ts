import * as ERROR_MSGS from '../constants/error_msgs';

export function isStackOverflowExeption(error: Error): boolean {
  return error instanceof RangeError || error.message === ERROR_MSGS.STACK_OVERFLOW;
}
