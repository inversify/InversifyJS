function isPromise<T>(object: unknown): object is Promise<T> {
  return object instanceof Promise
    // Fake promise used for testing
    || (typeof object === 'object' && object !== null && (object as {_isFakePromise: string})._isFakePromise === 'IS_FAKE_PROMISE');
}

function isPromiseOrContainsPromise<T>(object: unknown): object is Promise<T> | (T | Promise<T>)[] {
  if (isPromise(object)) {
    return true;
  }

  return Array.isArray(object) && object.some(isPromise);
}

export { isPromise, isPromiseOrContainsPromise };
