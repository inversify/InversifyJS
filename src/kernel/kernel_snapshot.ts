import interfaces from "../interfaces/interfaces";

class KernelSnapshot implements interfaces.KernelSnapshot {

    public bindings: interfaces.Lookup<interfaces.Binding<any>>;
    public middleware: interfaces.Next;

    public static of(bindings: interfaces.Lookup<interfaces.Binding<any>>, middleware: interfaces.Next) {
        let snapshot = new KernelSnapshot();
        snapshot.bindings = bindings;
        snapshot.middleware = middleware;
        return snapshot;
    }

}

export default KernelSnapshot;
