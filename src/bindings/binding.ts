import { interfaces } from "../interfaces/interfaces";
import { id } from "../utils/id";
import * as ERROR_MSGS from "../constants/error_msgs";
import { getServiceIdentifierAsString } from "../utils/serialization";
import { tryAndThrowErrorIfStackOverflow } from "../utils/exceptions";
import { getResolveScope } from "../scope/getResolveScope";

class Binding<TActivated> implements interfaces.Binding<TActivated> {

    public id: number;
    public moduleId: interfaces.ContainerModuleBase["id"];

    // A runtime identifier because at runtime we don't have interfaces
    public serviceIdentifier: interfaces.ServiceIdentifier<TActivated>;

    // The scope mode to be used
    public scope: interfaces.BindingScope;
    public resolveScope: interfaces.Scope<TActivated>;

    public valueProvider:interfaces.ValueProvider<TActivated,unknown> | null | undefined;

    // A constraint used to limit the contexts in which this binding is applicable
    public constraint: (request: interfaces.Request) => boolean;

    // On activation handler (invoked just before an instance is added to cache and injected)
    public onActivation: interfaces.BindingActivation<TActivated> | null;

    // On deactivation handler (invoked just before an instance is unbinded and removed from container)
    public onDeactivation: interfaces.BindingDeactivation<TActivated> | null;
    private isFactoryTypeValueProvider(valueProvider:interfaces.ValueProvider<TActivated,unknown>):
        valueProvider is interfaces.FactoryTypeValueProvider<TActivated,unknown> {
        return (valueProvider as interfaces.FactoryTypeValueProvider<TActivated,unknown>).factoryType !== undefined;
    }
    private invokeFactory(
        context:interfaces.Context,
        childRequests:interfaces.Request[],
        factory:interfaces.FactoryTypeValueProvider<TActivated,unknown>
      ): TActivated|Promise<TActivated>{
        return tryAndThrowErrorIfStackOverflow(
          () => factory.provideValue.bind(factory)(context,childRequests),
          () => new Error(
                  ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY(factory.factoryType, context.currentRequest.serviceIdentifier.toString())
                )
        );
      }

    public provideValue(context:interfaces.Context, childRequests:interfaces.Request[]):TActivated|Promise<TActivated>{
        if(!this.valueProvider){
            // The user created a binding but didn't finish it
            // e.g. container.bind<T>("Something"); missing BindingToSyntax
            const serviceIdentifierAsString = getServiceIdentifierAsString(this.serviceIdentifier);
            throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifierAsString}`);
        }
        if(this.isFactoryTypeValueProvider(this.valueProvider)){
            return this.invokeFactory(context, childRequests,this.valueProvider);
        }
        return this.valueProvider.provideValue(context, childRequests);
    }

    public setScope(scope:interfaces.BindingScope): void {
        this.scope = scope;
        this.resolveScope = getResolveScope<TActivated>(scope);
    }

    public constructor(serviceIdentifier: interfaces.ServiceIdentifier<TActivated>, scope: interfaces.BindingScope) {
        this.id = id();
        this.serviceIdentifier = serviceIdentifier;
        this.setScope(scope);
        this.constraint = (request: interfaces.Request) => true;
        this.onActivation = null;
        this.onDeactivation = null;
    }

    public clone(): interfaces.Binding<TActivated> {
        const clone = new Binding(this.serviceIdentifier, this.scope);
        clone.valueProvider = this.valueProvider?.clone();
        clone.scope = this.scope;
        clone.resolveScope = this.resolveScope.clone();
        clone.constraint = this.constraint;
        clone.onActivation = this.onActivation;
        clone.onDeactivation = this.onDeactivation;

        return clone;
    }

}

export { Binding };
