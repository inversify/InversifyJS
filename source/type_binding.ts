///<reference path="./interfaces.d.ts" />

// TypeBinding
// -----------

// A type binding (or just a binding) is a mapping between a service type
// (an interface), and an implementation type to be used to satisfy such
// a service requirement.

import { TypeBindingScopeEnum } from "./type_binding_scope";

class TypeBinding<TServiceType> implements ITypeBinding<TServiceType> {

    // The runtime identifier used because at runtime we don't have interfaces
    public runtimeIdentifier : string;

    // The constructor of a class which must implement TServiceType
    public implementationType : { new(): TServiceType ;};

    // Cache used to allow singleton scope
    public cache : TServiceType;

    // The scope mode to be used
    public scope : TypeBindingScopeEnum;

    constructor(
      runtimeIdentifier : string,
      implementationType : { new(...args : any[]): TServiceType ;},
      scopeType? : TypeBindingScopeEnum) {

      this.runtimeIdentifier = runtimeIdentifier;
      this.implementationType = implementationType;
      this.cache = null;
      if(typeof scopeType === "undefined") {
        // The default scope (Transient)
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

export { TypeBinding };
