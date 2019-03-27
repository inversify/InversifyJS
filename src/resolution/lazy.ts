class Lazy<T> {
  // TODO: this smells?
  public singleton: boolean;

  private promise: () => Promise<T>;
  private resolved: Promise<T>;

  public constructor(promise: () => Promise<T>) {
    this.promise = promise;
  }

  public resolve(): Promise<T> {
    if (!this.singleton) {
      return this.promise();
    }

    if (!this.resolved) {
      this.resolved = this.promise();
    }

    return this.resolved;
  }
}

export { Lazy };
