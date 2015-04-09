///<reference path="./inversify.d.ts" />

// TypeBinding
// -----------

// A type binding (or just a binding) is a mapping between a service type
// (generally an interface or abstract class), and an implementation type
// to be used to satisfy such a service requirement.

class TypeBinding<TServiceType>
  implements TypeBindingInterface<TServiceType> {

    // the runtime identifier used because at runtime we don't have interfaces
    public runtimeIdentifier : string;

    // constructor of an implemtation of TServiceType
    public implementationType : { new(): TServiceType ;};

    // once a service has been resolved we will cache the result to boost performance
    public cache : TServiceType;

    constructor(
      runtimeIdentifier : string,
      implementationType : { new(): TServiceType ;}) {

      this.runtimeIdentifier = runtimeIdentifier;
      this.implementationType = implementationType;
      this.cache = null;
    }
}

export = TypeBinding;
