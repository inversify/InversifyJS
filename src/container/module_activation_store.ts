import { interfaces } from '../interfaces/interfaces';
import { Lookup } from './lookup';

export class ModuleActivationStore implements interfaces.ModuleActivationStore {
  private _map = new Map<number, interfaces.ModuleActivationHandlers>();

  public remove(moduleId: number): interfaces.ModuleActivationHandlers {
    if (this._map.has(moduleId)) {
      const handlers = this._map.get(moduleId);
      this._map.delete(moduleId);
      return handlers!;
    }
    return this._getEmptyHandlersStore();
  }

  public addDeactivation(
    moduleId: number,
    serviceIdentifier: interfaces.ServiceIdentifier<unknown>,
    onDeactivation: interfaces.BindingDeactivation<unknown>,
  ) {
    this._getModuleActivationHandlers(moduleId)
      .onDeactivations.add(serviceIdentifier, onDeactivation);
  }

  public addActivation(
    moduleId: number,
    serviceIdentifier: interfaces.ServiceIdentifier<unknown>,
    onActivation: interfaces.BindingActivation<unknown>,
  ) {
    this._getModuleActivationHandlers(moduleId)
      .onActivations.add(serviceIdentifier, onActivation);
  }

  public clone(): interfaces.ModuleActivationStore {
    const clone = new ModuleActivationStore();

    this._map.forEach((handlersStore, moduleId) => {
      clone._map.set(moduleId, {
        onActivations: handlersStore.onActivations.clone(),
        onDeactivations: handlersStore.onDeactivations.clone(),
      });
    });

    return clone;
  }

  private _getModuleActivationHandlers(moduleId: number): interfaces.ModuleActivationHandlers {
    let moduleActivationHandlers: interfaces.ModuleActivationHandlers | undefined = this._map.get(moduleId);

    if (moduleActivationHandlers === undefined) {
      moduleActivationHandlers = this._getEmptyHandlersStore();
      this._map.set(moduleId, moduleActivationHandlers);
    }

    return moduleActivationHandlers;
  }

  private _getEmptyHandlersStore(): interfaces.ModuleActivationHandlers {
    const handlersStore: interfaces.ModuleActivationHandlers = {
      onActivations: new Lookup(),
      onDeactivations: new Lookup()
    };
    return handlersStore;
  }
}
