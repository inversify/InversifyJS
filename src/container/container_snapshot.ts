import { interfaces } from "../interfaces/interfaces";

class ContainerSnapshot implements interfaces.ContainerSnapshot {

    public bindings: interfaces.Lookup<interfaces.Binding<any>>;
    public activations: interfaces.Lookup<interfaces.BindingActivation<any>>;
    public deactivations: interfaces.Lookup<interfaces.BindingDeactivation<any>>;
    public middleware: interfaces.Next | null;
    public moduleActivationStore: interfaces.ModuleActivationStore;

    public static of(
      bindings: interfaces.Lookup<interfaces.Binding<any>>,
      middleware: interfaces.Next | null,
      activations: interfaces.Lookup<interfaces.BindingActivation<any>>,
      deactivations: interfaces.Lookup<interfaces.BindingDeactivation<any>>,
      moduleActivationStore: interfaces.ModuleActivationStore
    ) {
        const snapshot = new ContainerSnapshot();
        snapshot.bindings = bindings;
        snapshot.middleware = middleware;
        snapshot.deactivations = deactivations;
        snapshot.activations = activations;
        snapshot.moduleActivationStore = moduleActivationStore;
        return snapshot;
    }

}

export { ContainerSnapshot };
