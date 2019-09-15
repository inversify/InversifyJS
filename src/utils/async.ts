function isPromise(object: any): boolean {
  return object && object.then !== undefined && typeof object.then === "function";
}

export { isPromise };
