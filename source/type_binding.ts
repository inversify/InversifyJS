///<reference path="./interfaces.d.ts" />

// TypeBinding
// -----------

// A type binding (or just a binding) is a mapping between a service type
// (an interface), and an implementation type to be used to satisfy such
// a service requirement.

import TypeBindingScopeEnum = require("./type_binding_scope");

class TypeBinding<TServiceType> implements TypeBindingInterface<TServiceType> {

    // The runtime identifier used because at runtime
    // we don't have interfaces
    public runtimeIdentifier : string;

    // Constructor of an implemtation of TServiceType
    public implementationType : { new(): TServiceType ;};

    // Once a service has been resolved we will cache
    // the result to boost performance
    public cache : TServiceType;

    // The scope of the type.
    public scope : TypeBindingScopeEnum;

    constructor(
      runtimeIdentifier : string,
      implementationType : { new(): TServiceType ;},
      scopeType? : TypeBindingScopeEnum) {

      this.runtimeIdentifier = runtimeIdentifier;
      this.implementationType = implementationType;
      this.cache = null;
      if(typeof scopeType === "undefined") {
        // Default scope is Transient
        this.scope = TypeBindingScopeEnum.Transient;
      }
      else {
        if(TypeBindingScopeEnum[scopeType]) {
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
