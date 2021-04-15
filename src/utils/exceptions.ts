import { STACK_OVERFLOW } from '../constants/error_msgs';


export function isStackOverflowExeption(error: Error): boolean {
  return error instanceof RangeError ||
    error.message === STACK_OVERFLOW;
}
