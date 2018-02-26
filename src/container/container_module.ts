import { interfaces } from "../interfaces/interfaces";
import { guid } from "../utils/guid";

export class ContainerModule implements interfaces.ContainerModule {

    public guid: string;
    public registry: interfaces.ContainerModuleCallBack;

    public constructor(registry: interfaces.ContainerModuleCallBack) {
        this.guid = guid();
        this.registry = registry;
    }

}

export class AsyncContainerModule implements interfaces.AsyncContainerModule {

    public guid: string;
    public registry: interfaces.AsyncContainerModuleCallBack;

    public constructor(registry: interfaces.AsyncContainerModuleCallBack) {
        this.guid = guid();
        this.registry = registry;
    }

}
