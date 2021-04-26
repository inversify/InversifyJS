import { interfaces } from "../interfaces/interfaces";

export class ModuleActivationStore implements interfaces.ModuleActivationStore {
    private _map = new Map<number, interfaces.ModuleActivationHandlers>();
    remove(moduleId: interfaces.ContainerModuleBase["id"]): interfaces.ModuleActivationHandlers {
        if (this._map.has(moduleId)) {
            const handlers = this._map.get(moduleId);
            this._map.delete(moduleId);
            return handlers!;
        }
        return this._getHandlersStore();
    }

    addDeactivation(moduleId: interfaces.ContainerModuleBase["id"], onDeactivation: interfaces.BindingDeactivation<any>) {
        const entry = this._map.get(moduleId);
        if (entry !== undefined) {
            entry.onDeactivations.push(onDeactivation);
        } else {
            const handlersStore = this._getHandlersStore();
            handlersStore.onDeactivations.push(onDeactivation);
            this._map.set(moduleId, handlersStore);
        }
    }

    addActivation(moduleId: interfaces.ContainerModuleBase["id"], onActivation: interfaces.BindingActivation<any>) {
        const entry = this._map.get(moduleId);
        if (entry !== undefined) {
            entry.onActivations.push(onActivation);
        } else {
            const handlersStore = this._getHandlersStore();
            handlersStore.onActivations.push(onActivation);
            this._map.set(moduleId, handlersStore);
        }
    }

    clone(): interfaces.ModuleActivationStore {
        const clone = new ModuleActivationStore();
        this._map.forEach((handlersStore, moduleId) => {
            handlersStore.onActivations.forEach(onActivation => clone.addActivation(moduleId,onActivation));
            handlersStore.onDeactivations.forEach(onDeactivation => clone.addDeactivation(moduleId,onDeactivation));
        })
        return clone;
    }

    private _getHandlersStore(): interfaces.ModuleActivationHandlers {
        const handlersStore: interfaces.ModuleActivationHandlers = {
            onActivations: [],
            onDeactivations: []
        };
        return handlersStore;
    }
}
