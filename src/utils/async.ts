function isPromise(object: any): object is Promise<any> {
  return object && object.then !== undefined && typeof object.then === "function";
}

function isPromiseOrContainsPromise<T>(object: unknown): object is Promise<T> | (T | Promise<T>)[] {
  if (isPromise(object)) {
    return true;
  }

  return Array.isArray(object) && object.some(isPromise);
}

export { isPromise, isPromiseOrContainsPromise };
