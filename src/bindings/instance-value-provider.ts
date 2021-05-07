import { interfaces } from "../interfaces/interfaces";
import { resolveInstance } from "../resolution/instantiation";

export class InstanceValueProvider<TActivated> implements interfaces.InstanceValueProvider<TActivated>{
  type: "Instance" = "Instance";
  valueFrom: interfaces.Newable<TActivated>;
  provideValue(context:interfaces.Context, childRequests:interfaces.Request[]): TActivated {
    const binding = context.currentRequest.bindings[0];
      return resolveInstance(
        binding,
        binding.valueProvider!.valueFrom as interfaces.Newable<TActivated>,
        childRequests,
    );
  }
  clone(){
    const clone = new InstanceValueProvider<TActivated>();
    clone.valueFrom = this.valueFrom;
    return clone;
  }
}