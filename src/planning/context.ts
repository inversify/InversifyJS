import interfaces from "../interfaces/interfaces";
import guid from "../utils/guid";

class Context implements interfaces.Context {

    public guid: string;
    public kernel: interfaces.Kernel;
    public plan: interfaces.Plan;

    public constructor(kernel: interfaces.Kernel) {
        this.guid = guid();
        this.kernel = kernel;
    }

    public addPlan(plan: interfaces.Plan) {
        this.plan = plan;
    }
}

export default Context;
