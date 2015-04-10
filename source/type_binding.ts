///<reference path="./inversify.d.ts" />

// TypeBinding
// -----------

// A type binding (or just a binding) is a mapping between a service type
// (an interface), and an implementation type to be used to satisfy such
// a service requirement.

class TypeBinding<TServiceType>
  implements TypeBindingInterface<TServiceType> {

    // The runtime identifier used because at runtime
    // we don't have interfaces
    public runtimeIdentifier : string;

    // Constructor of an implemtation of TServiceType
    public implementationType : { new(): TServiceType ;};

    // Once a service has been resolved we will cache
    // the result to boost performance
    public cache : TServiceType;

    // The scope of the type.
    public scope : string;

    constructor(
      runtimeIdentifier : string,
      implementationType : { new(): TServiceType ;},
      scopeType? : string) {

      var scopes = ["TRANSIENT", "SINGLETON"];
      this.runtimeIdentifier = runtimeIdentifier;
      this.implementationType = implementationType;
      this.cache = null;
      if(typeof scopeType === "undefined") {
        this.scope = scopes[0];
      }
      else {
        // Accepted values are "SINGLETON" and "TRANSIENT" (default)
        if(scopes.indexOf(scopeType) !== -1) {
          this.scope = scopeType;
        }
        else {
          var msg = `Invalid scope type ${scopeType}`;
          throw new Error(msg);
        }
      }
    }
}

export = TypeBinding;
