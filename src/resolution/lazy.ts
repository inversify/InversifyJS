import { interfaces } from "../interfaces/interfaces";
import Context = interfaces.Context;
import OnActivation = interfaces.OnActivation;

class Lazy<T> {
  private promise: () => Promise<T>;
  private onActivation: OnActivation<T>;
  private context: Context;
  private resolved: T;

  public constructor(promise: () => Promise<T>, context: Context, onActivation: OnActivation<T>) {
    this.promise = promise;
    this.onActivation = onActivation;
    this.context = context;
  }

  public async resolve(): Promise<T> {
    if (this.resolved) {
      // only resolve once to prevent double triggering of onActivation
      return this.resolved;
    }

    this.resolved = await this.promise();

    if (this.onActivation) {
      this.resolved = this.onActivation(this.context, this.resolved);
    }

    return this.resolved;
  }
}

export { Lazy };
