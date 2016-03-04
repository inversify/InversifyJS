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
    public implementationType: { new(): T; };

    // Cache used to allow singleton scope and BindingType.Value bindings
    public cache: T;

    // The scope mode to be used
    public scope: BindingScope;

    // The kind of binding
    public type: BindingType;

    // A factory method used in BindingType.Factory bindings
    public factory: (context) => T;

    constructor(runtimeIdentifier: string) {
      this.runtimeIdentifier = runtimeIdentifier;
      this.type = BindingType.Instance;
      this.implementationType = null;
      this.cache = null;
      this.factory = null;
      this.scope = BindingScope.Transient;
    }
}

export default Binding;
