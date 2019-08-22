import { interfaces } from "../interfaces/interfaces";
import { Lazy } from "../resolution/lazy";
import { id } from "../utils/id";
import { getBindingDictionary } from "./planner";

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

    const containers = [this.container];

    let parent = this.container.parent;

    while (parent) {
      containers.unshift(parent);

      parent = parent.parent;
    }

    const iter = containers.entries();

    return this.activationLoop(iter.next().value[1], iter, binding, request.serviceIdentifier, result);
  }

  private activationLoop<T>(
    container: interfaces.Container,
    containerIterator: IterableIterator<[number, interfaces.Container]>,
    binding: interfaces.Binding<T>,
    identifier: interfaces.ServiceIdentifier<T>,
    previous: T | Promise<T>,
    iterator?: IterableIterator<[number, interfaces.BindingActivation<any>]>
  ): T | Lazy<any> {
    if (previous instanceof Promise) {
      return new Lazy(binding, async () => {
        const resolved = await previous;

        return this.activationLoop(container, containerIterator, binding, identifier, resolved);
      });
    }

    let result = previous;

    let iter = iterator;

    if (!iter) {
      // smell accessing _activations, but similar pattern is done in planner.getBindingDictionary()
      const activations = (container as any)._activations as interfaces.Lookup<interfaces.BindingActivation<any>>;

      iter = activations.hasKey(identifier) ? activations.get(identifier).entries() : [].entries();
    }

    let next = iter.next();

    while (!next.done) {
      result = next.value[1](this, result);

      if (result instanceof Promise) {
        return new Lazy(binding, async () => {
          const resolved = await result;

          return this.activationLoop(container, containerIterator, binding, identifier, resolved, iter);
        });
      }

      next = iter.next();
    }

    const nextContainer = containerIterator.next();

    if (nextContainer.value && !getBindingDictionary(container).hasKey(identifier)) {
      // make sure if we are currently on the container that owns the binding, not to keep looping down to child containers
      return this.activationLoop(nextContainer.value[1], containerIterator, binding, identifier, result);
    }

    return result;
  }
}

export { Context };
