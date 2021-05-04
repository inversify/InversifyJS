import { interfaces } from "../inversify";
import { isPromise } from "../utils/async";

export class SingletonScope<T> implements interfaces.Scope<T> {
    get(binding: interfaces.Binding<T>, _: interfaces.Request): Promise<T> | T | null {
        if (binding.activated) {
            return binding.cache;
        }
        return null;
    }
    set(binding: interfaces.Binding<T>, _: interfaces.Request, resolved: T | Promise<T>): T | Promise<T> {
        binding.cache = resolved;
        binding.activated = true;

        if (isPromise(resolved)) {
            resolved = resolved.catch((ex) => {
                // allow binding to retry in future
                binding.cache = null;
                binding.activated = false;

                throw ex;
            });
        }
        return resolved;
    }
}
