import { interfaces } from "../interfaces/interfaces";

class ContainerSnapshot implements interfaces.ContainerSnapshot {

    public bindings: interfaces.Lookup<interfaces.Binding<any>>;
    public activations: interfaces.Lookup<interfaces.BindingActivation<any>>;
    public middleware: interfaces.Next | null;

    public static of(
      bindings: interfaces.Lookup<interfaces.Binding<any>>,
      middleware: interfaces.Next | null,
      activations: interfaces.Lookup<interfaces.BindingActivation<any>>
    ) {
        const snapshot = new ContainerSnapshot();
        snapshot.bindings = bindings;
        snapshot.middleware = middleware;
        snapshot.activations = activations;
        return snapshot;
    }

}

export { ContainerSnapshot };
