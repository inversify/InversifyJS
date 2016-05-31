///<reference path="../interfaces/interfaces.d.ts" />

export default class KernelSnapshot implements IKernelSnapshot {
    public bindings: ILookup<IBinding<any>>;
    public middleware: PlanAndResolve<any>;

    public static of(bindings: ILookup<IBinding<any>>, middleware: PlanAndResolve<any>) {
        let snapshot = new KernelSnapshot();
        snapshot.bindings = bindings;
        snapshot.middleware = middleware;
        return snapshot;
    }
}
