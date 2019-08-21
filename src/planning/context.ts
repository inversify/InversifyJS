import { interfaces } from "../interfaces/interfaces";
import { Lazy } from "../resolution/lazy";
import { id } from "../utils/id";

class Context implements interfaces.Context {

  public id: number;
  public container: interfaces.Container;
  public plan: interfaces.Plan;
  public currentRequest: interfaces.Request;

  public constructor(
    container: interfaces.Container) {
    this.id = id();
    this.container = container;
  }

  public addPlan(plan: interfaces.Plan) {
    this.plan = plan;
  }

  public setCurrentRequest(currentRequest: interfaces.Request) {
    this.currentRequest = currentRequest;
  }

  public onActivation<T>(request: interfaces.Request, binding: interfaces.Binding<T>, resolved: T): T | Lazy<any> {
    if (resolved instanceof Lazy) {
      return new Lazy(binding, async () => this.onActivation(request, binding, await resolved.resolve()));
    }

    let result: T | Promise<T> = resolved;

    // use activation handler if available
    if (typeof binding.onActivation === "function") {
      result = binding.onActivation(this, result);
    }

    return this.activationLoop(binding, request.serviceIdentifier, result);
  }

  private activationLoop<T>(
    binding: interfaces.Binding<T>,
    identifier: interfaces.ServiceIdentifier<T>,
    previous: T | Promise<T>,
    iterator?: IterableIterator<interfaces.BindingActivation<any>>
  ): T | Lazy<any> {
    if (previous instanceof Promise) {
      return new Lazy(binding, async () => {
        const resolved = await previous;

        return this.activationLoop(binding, identifier, resolved);
      });
    }

    let iter = iterator;

    if (!iter) {
      // smell accessing _activations, but similar pattern is done in planner.getBindingDictionary()
      const activations = (this.container as any)._activations.get(identifier);

      if (!activations) {
        return previous;
      }

      iter = (activations as interfaces.BindingActivation<any>[]).values();
    }

    let next = iter.next();

    let result = previous;

    while (!next.done) {
      result = next.value(this, result);

      if (result instanceof Promise) {
        return new Lazy(binding, async () => {
          const resolved = await result;

          return this.activationLoop(binding, identifier, resolved, iter);
        });
      }

      next = iter.next();
    }

    return result;
  }
}

export { Context };
