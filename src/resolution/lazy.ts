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
      return this.nested(this.promise());
    }

    if (!this.resolved) {
      this.resolved = this.nested(this.promise());
    }

    return this.resolved;
  }

  private nested(value: Promise<T> | Lazy<T> | T): Promise<T> {
    if (value instanceof Lazy) {
      return value.resolve().then((unlazied) => this.nested(unlazied));
    }

    if (value instanceof Promise) {
      return value.then((resolved) => this.nested(resolved));
    }

    return Promise.resolve(value);
  }
}

export { Lazy };
