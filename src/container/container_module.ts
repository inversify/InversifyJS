import interfaces from "../interfaces/interfaces";
import guid from "../utils/guid";

class ContainerModule implements interfaces.ContainerModule {

    public guid: string;
    public registry: (bind: interfaces.Bind) => void;

    public constructor(registry: (bind: interfaces.Bind) => void) {
        this.guid = guid();
        this.registry = registry;
    }

}

export default ContainerModule;
