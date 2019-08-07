import { BindingScopeEnum } from "../constants/literal_types";
import { interfaces } from "../interfaces/interfaces";

class Lazy<T> {
  private promise: () => Promise<T>;
  private binding: interfaces.Binding<T>;
  private resolved: Promise<T>;

  public constructor(binding: interfaces.Binding<T>, promise: () => Promise<T>) {
    this.binding = binding;
    this.promise = promise;
  }

  public resolve(): Promise<T> {
    if (this.binding.scope !== BindingScopeEnum.Singleton) {
      return this.promise();
    }

    if (!this.resolved) {
      this.resolved = this.promise();
    }

    return this.resolved;
  }
}

export { Lazy };
