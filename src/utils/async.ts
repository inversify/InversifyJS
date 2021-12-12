function isPromise<T>(object: unknown): object is Promise<T> {
  const isObjectOrFunction = (typeof object === 'object' && object !== null) || typeof object === 'function';

  return isObjectOrFunction && typeof (object as PromiseLike<T>).then === "function";
}

function isPromiseOrContainsPromise<T>(object: unknown): object is Promise<T> | (T | Promise<T>)[] {
  if (isPromise(object)) {
    return true;
  }

  return Array.isArray(object) && object.some(isPromise);
}

export { isPromise, isPromiseOrContainsPromise };
