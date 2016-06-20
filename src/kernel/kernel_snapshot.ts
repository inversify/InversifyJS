import interfaces from "../interfaces/interfaces";

class KernelSnapshot implements interfaces.KernelSnapshot {

    public bindings: interfaces.Lookup<interfaces.Binding<any>>;
    public middleware: interfaces.PlanAndResolve<any>;

    public static of(bindings: interfaces.Lookup<interfaces.Binding<any>>, middleware: interfaces.PlanAndResolve<any>) {
        let snapshot = new KernelSnapshot();
        snapshot.bindings = bindings;
        snapshot.middleware = middleware;
        return snapshot;
    }

}

export default KernelSnapshot;
