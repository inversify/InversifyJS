import { interfaces } from "../interfaces/interfaces";
import { guid } from "../utils/guid";
import { BindingTypeEnum } from "../constants/literal_types";

class Binding<T> implements interfaces.Binding<T> {

    public guid: string;
    public moduleId: string;

    // Determines wether the bindings has been already activated
    // The activation action takes place when an instance is resolved
    // If the scope is singleton it only happens once
    public activated: boolean;

    // A runtime identifier because at runtime we don't have interfaces
    public serviceIdentifier: interfaces.ServiceIdentifier<T>;

    // The constructor of a class which must implement T
    public implementationType: interfaces.Newable<T> | null;

    // Cache used to allow singleton scope and BindingType.ConstantValue bindings
    public cache: T | null;

    // Cache used to allow BindingType.DynamicValue bindings
    public dynamicValue: ((context: interfaces.Context) => T) | null;

    // The scope mode to be used
    public scope: interfaces.BindingScope;

    // The kind of binding
    public type: interfaces.BindingType;

    // A factory method used in BindingType.Factory bindings
    public factory: interfaces.FactoryCreator<T> | null;

    // An async factory method used in BindingType.Provider bindings
    public provider: interfaces.ProviderCreator<T> | null;

    // A constraint used to limit the contexts in which this binding is applicable
    public constraint: (request: interfaces.Request) => boolean;

    // On activation handler (invoked just before an instance is added to cache and injected)
    public onActivation: ((context: interfaces.Context, injectable: T) => T) | null;

    constructor(serviceIdentifier: interfaces.ServiceIdentifier<T>, defaultScope: interfaces.BindingScope) {
        this.guid = guid();
        this.activated = false;
        this.serviceIdentifier = serviceIdentifier;
        this.scope = defaultScope;
        this.type = BindingTypeEnum.Invalid;
        this.constraint = (request: interfaces.Request) => { return true; };
        this.implementationType = null;
        this.cache = null;
        this.factory = null;
        this.provider = null;
        this.onActivation = null;
        this.dynamicValue = null;
    }

    public clone(): interfaces.Binding<T> {
        let clone = new Binding(this.serviceIdentifier, this.scope);
        clone.activated = false;
        clone.implementationType = this.implementationType;
        clone.dynamicValue = this.dynamicValue;
        clone.scope = this.scope;
        clone.type = this.type;
        clone.factory = this.factory;
        clone.provider = this.provider;
        clone.constraint = this.constraint;
        clone.onActivation = this.onActivation;
        clone.cache = this.cache;
        return clone;
    }

}

export { Binding };
