function isPromise(object: any): object is Promise<any> {
  return object && object.then !== undefined && typeof object.then === "function";
}

export { isPromise };
