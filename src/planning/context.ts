///<reference path="../interfaces/interfaces.d.ts" />

import guid from "../utils/guid";

class Context<TService> implements IContext {

    public guid: string;
    public kernel: IKernel;
    public plan: IPlan;

    public constructor(kernel: IKernel) {
        this.guid = guid();
        this.kernel = kernel;
    }

    public addPlan(plan: IPlan) {
        this.plan = plan;
    }
}

export default Context;
