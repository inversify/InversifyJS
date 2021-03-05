import * as interfaces from '../interfaces/interfaces';

class ContainerSnapshot implements interfaces.ContainerSnapshot {
	public bindings: interfaces.Lookup<interfaces.Binding<unknown>>;
	public middleware: interfaces.Next | null;

	public static of(bindings: interfaces.Lookup<interfaces.Binding<unknown>>, middleware: interfaces.Next | null) {
		const snapshot = new ContainerSnapshot();
		snapshot.bindings = bindings;
		snapshot.middleware = middleware;
		return snapshot;
	}
}

export { ContainerSnapshot };
