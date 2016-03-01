///<reference path="../interfaces/interfaces.d.ts" />

// Binding
// -----------

// A type binding (or just a binding) is a mapping between a service type
// (an interface), and an implementation type to be used to satisfy such
// a service requirement.

import { BindingScope } from "./binding_scope";

class Binding<TService> implements IBinding<TService> {

    // A runtime identifier because at runtime we don't have interfaces
    public runtimeIdentifier: string;

    // The constructor of a class which must implement TService
    public implementationType: { new(): TService; };

    // Cache used to allow singleton scope
    public cache: TService;

    // The scope mode to be used
    public scope: BindingScope;

    constructor(
      runtimeIdentifier: string,
      implementationType: { new(...args: any[]): TService; },
      scopeType?: BindingScope) {

      this.runtimeIdentifier = runtimeIdentifier;
      this.implementationType = implementationType;
      this.cache = null;

      if (typeof scopeType === "undefined") {
        this.scope = BindingScope.Transient; // default (Transient)
      } else {
        if (BindingScope[scopeType]) {
            this.scope = scopeType;
        } else {
          let msg = `Invalid scope type ${scopeType}`;
          throw new Error(msg);
        }
      }
    }
}

export { Binding };
