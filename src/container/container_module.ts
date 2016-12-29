import { interfaces } from "../interfaces/interfaces";
import { guid } from "../utils/guid";

class ContainerModule implements interfaces.ContainerModule {

    public guid: string;
    public registry: (bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound) => void;

    public constructor(registry: (bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound) => void) {
        this.guid = guid();
        this.registry = registry;
    }

}

export { ContainerModule };
