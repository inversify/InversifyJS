import { interfaces } from "../interfaces/interfaces";
import { id } from "../utils/id";
import { NotConfiguredScope } from "../scope/not-configured-scope";
import { NotConfiguredValueProvider } from "./not-configured-value-provider";

class Binding<TActivated> implements interfaces.Binding<TActivated> {

    public id: number;
    public moduleId: interfaces.ContainerModuleBase["id"];

    // A runtime identifier because at runtime we don't have interfaces
    public serviceIdentifier: interfaces.ServiceIdentifier<TActivated>;

    // Scope
    public scope: interfaces.ResolveScope<TActivated>;

    public valueProvider:interfaces.ValueProviderType<TActivated>;

    // A constraint used to limit the contexts in which this binding is applicable
    public constraint: (request: interfaces.Request) => boolean;

    // On activation handler (invoked just before an instance is added to cache and injected)
    public onActivation: interfaces.BindingActivation<TActivated> | null;

    // On deactivation handler (invoked just before an instance is unbinded and removed from container)
    public onDeactivation: interfaces.BindingDeactivation<TActivated> | null;

    public constructor(serviceIdentifier: interfaces.ServiceIdentifier<TActivated>) {
        this.id = id();
        this.serviceIdentifier = serviceIdentifier;
        this.scope = new NotConfiguredScope(serviceIdentifier);
        this.valueProvider = new NotConfiguredValueProvider(serviceIdentifier);
        this.constraint = (request: interfaces.Request) => true;
        this.onActivation = null;
        this.onDeactivation = null;
    }

    public clone(): interfaces.Binding<TActivated> {
        const clone = new Binding(this.serviceIdentifier);
        clone.valueProvider = this.valueProvider.clone() as interfaces.ValueProviderType<TActivated>;
        clone.scope = this.scope.clone();
        clone.constraint = this.constraint;
        clone.onActivation = this.onActivation;
        clone.onDeactivation = this.onDeactivation;

        return clone;
    }

}

export { Binding };
