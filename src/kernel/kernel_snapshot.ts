///<reference path="../interfaces/interfaces.d.ts" />

export default class KernelSnapshot implements IKernelSnapshot {
    public bindings: ILookup<IBinding<any>>;
    public middleware: (context: IContext) => void;

    public static of(bindings: ILookup<IBinding<any>>, middleware: (context: IContext) => void) {
        let snapshot = new KernelSnapshot();
        snapshot.bindings = bindings;
        snapshot.middleware = middleware;
        return snapshot;
    }
}
