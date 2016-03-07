///<reference path="../interfaces/interfaces.d.ts" />

// Binding
// -----------

// A type binding (or just a binding) is a mapping between a service type
// (an interface), and an implementation type to be used to satisfy such
// a service requirement.

import BindingScope from "./binding_scope";
import BindingType from "./binding_type";

class Binding<T> implements IBinding<T> {

    // A runtime identifier because at runtime we don't have interfaces
    public runtimeIdentifier: string;

    // The constructor of a class which must implement T
    public implementationType: INewable<T>;

    // Cache used to allow singleton scope and BindingType.Value bindings
    public cache: T;

    // The scope mode to be used
    public scope: BindingScope;

    // The kind of binding
    public type: BindingType;

    // A factory method used in BindingType.Factory bindings
    public factory: IFactoryCreator<T>;

    // An async factory method used in BindingType.Provider bindings
    public provider: IProviderCreator<T>;

    constructor(runtimeIdentifier: string) {
      this.runtimeIdentifier = runtimeIdentifier;
      this.scope = BindingScope.Transient;
      this.type = BindingType.Invalid;
      this.implementationType = null;
      this.cache = null;
      this.factory = null;
    }
}

export default Binding;
