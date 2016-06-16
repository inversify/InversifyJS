/// <reference path="../interfaces/interfaces.d.ts" />

import guid from "../utils/guid";

class KernelModule implements IKernelModule {

    public guid: string;
    public registry: (bind: IBind) => void;

    public constructor(registry: (bind: IBind) => void) {
        this.guid = guid();
        this.registry = registry;
    }

}

export default KernelModule;
