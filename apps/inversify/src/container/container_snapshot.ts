import { interfaces } from '../interfaces/interfaces';

class ContainerSnapshot implements interfaces.ContainerSnapshot {
  public bindings!: interfaces.Lookup<interfaces.Binding<unknown>>;
  public activations!: interfaces.Lookup<interfaces.BindingActivation<unknown>>;
  public deactivations!: interfaces.Lookup<interfaces.BindingDeactivation<unknown>>;
  public middleware!: interfaces.Next | null;
  public moduleActivationStore!: interfaces.ModuleActivationStore;

  public static of(
    bindings: interfaces.Lookup<interfaces.Binding<unknown>>,
    middleware: interfaces.Next | null,
    activations: interfaces.Lookup<interfaces.BindingActivation<unknown>>,
    deactivations: interfaces.Lookup<interfaces.BindingDeactivation<unknown>>,
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
