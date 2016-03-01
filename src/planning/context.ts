///<reference path="../interfaces/interfaces.d.ts" />

class Context<TService> implements IContext {

    public kernel: IKernel;
    public plan: IPlan;

    public constructor(kernel: IKernel) {
        this.kernel = kernel;
    }

    public addPlan(plan: IPlan) {
        this.plan = plan;
    }
}

export { Context };
