import { interfaces } from "../interfaces/interfaces";

class ContainerSnapshot implements interfaces.ContainerSnapshot {

    public bindings: interfaces.Lookup<interfaces.Binding<any>>;
    public middleware: interfaces.Next | null;

    public static of(bindings: interfaces.Lookup<interfaces.Binding<any>>, middleware: interfaces.Next | null) {
        let snapshot = new ContainerSnapshot();
        snapshot.bindings = bindings;
        snapshot.middleware = middleware;
        return snapshot;
    }

}

export { ContainerSnapshot };
