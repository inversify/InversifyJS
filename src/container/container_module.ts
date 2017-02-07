import { interfaces } from "../interfaces/interfaces";
import { guid } from "../utils/guid";

class ContainerModule implements interfaces.ContainerModule {

    public guid: string;
    public registry: interfaces.ContainerModuleCallBack;

    public constructor(registry: interfaces.ContainerModuleCallBack) {
        this.guid = guid();
        this.registry = registry;
    }

}

export { ContainerModule };
