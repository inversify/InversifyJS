import { BindingScopeEnum, BindingTypeEnum } from '../constants/literal_types';
import { interfaces } from '../interfaces/interfaces';
import { id } from '../utils/id';

class Binding<TActivated> implements interfaces.Binding<TActivated> {

  public id: number;
  public moduleId!: interfaces.ContainerModuleBase['id'];

  // Determines weather the bindings has been already activated
  // The activation action takes place when an instance is resolved
  // If the scope is singleton it only happens once
  public activated: boolean;

  // A runtime identifier because at runtime we don't have interfaces
  public serviceIdentifier: interfaces.ServiceIdentifier<TActivated>;

  // constructor from binding to or toConstructor
  public implementationType: interfaces.Newable<TActivated> | TActivated | null;

  // Cache used to allow singleton scope and BindingType.ConstantValue bindings
  public cache: TActivated | Promise<TActivated> | null;

  // Cache used to allow BindingType.DynamicValue bindings
  public dynamicValue: interfaces.DynamicValue<TActivated> | null;

  // The scope mode to be used
  public scope: interfaces.BindingScope;

  // The kind of binding
  public type: interfaces.BindingType;

  // A factory method used in BindingType.Factory bindings
  public factory: interfaces.FactoryCreator<unknown> | null;

  // An async factory method used in BindingType.Provider bindings
  public provider: interfaces.ProviderCreator<unknown> | null;

  // A constraint used to limit the contexts in which this binding is applicable
  public constraint: interfaces.ConstraintFunction;

  // On activation handler (invoked just before an instance is added to cache and injected)
  public onActivation: interfaces.BindingActivation<TActivated> | null;

  // On deactivation handler (invoked just before an instance is unbinded and removed from container)
  public onDeactivation: interfaces.BindingDeactivation<TActivated> | null;

  public constructor(serviceIdentifier: interfaces.ServiceIdentifier<TActivated>, scope: interfaces.BindingScope) {
    this.id = id();
    this.activated = false;
    this.serviceIdentifier = serviceIdentifier;
    this.scope = scope;
    this.type = BindingTypeEnum.Invalid;
    this.constraint = (request: interfaces.Request | null) => true;
    this.implementationType = null;
    this.cache = null;
    this.factory = null;
    this.provider = null;
    this.onActivation = null;
    this.onDeactivation = null;
    this.dynamicValue = null;
  }

  public clone(): interfaces.Binding<TActivated> {
    const clone = new Binding(this.serviceIdentifier, this.scope);
    clone.activated = (clone.scope === BindingScopeEnum.Singleton) ? this.activated : false;
    clone.implementationType = this.implementationType;
    clone.dynamicValue = this.dynamicValue;
    clone.scope = this.scope;
    clone.type = this.type;
    clone.factory = this.factory;
    clone.provider = this.provider;
    clone.constraint = this.constraint;
    clone.onActivation = this.onActivation;
    clone.onDeactivation = this.onDeactivation;
    clone.cache = this.cache;
    return clone;
  }

}

export { Binding };
