///<reference path="./inversify.d.ts" />

// Inversify
// ---------

// Inversify is a lightweight pico container for TypeScript and JavaScript apps.

// A pico container uses a class constructor to identify and inject its
// dependencies. For this to work, the class needs to declare a constructor that
// includes everything it needs injected.

// In order to resolve a depencency, the pico container needs to be told which
// implementation type (classes) to associate with each service type (interfaces).

class Kernel implements KernelInterface {

  // The objet properties are used as unique keys type bindings are used as values
  private _bindings : Object;

  // Regiters a type binding
  public bind(typeBinding : TypeBindingInterface<any>) : void {
    if(this._validateBinding(typeBinding) === true){
      this._bindings[typeBinding.runtimeIdentifier] = typeBinding;
    }
  }

  // Removes a type binding from the registry by key
  public unbind(runtimeIdentifier : string) : void {
    var binding = this._bindings[runtimeIdentifier];

    if(binding === "undefined") {
      throw new Error(`Could not resolve service ${runtimeIdentifier}`);
    }
    delete this._bindings[runtimeIdentifier];
  }

  // Removes all the type bindings from the registry
  unbindAll() : void {
    this._bindings = new Object();
  }
  public resolve<TImplementationType>(runtimeIdentifier : string) : TImplementationType {

    var binding = this._bindings[runtimeIdentifier];

    if(binding === "undefined") {
      throw new Error(`Could not resolve service ${runtimeIdentifier}`);
    }

    if(binding.cache !== null) {
      // return clone of cached instance
      var json = JSON.stringify(binding.cache);
      var clone = JSON.parse(json);
      return clone;
    }
    else {
      // TODO resolve
    }
  }

  //Validates a type binding
  private _validateBinding(typeBinding : TypeBindingInterface<any>) : boolean {

    var isValid = true;

    // Runtime identifier is a string
    if(typeof typeBinding.runtimeIdentifier !== "string") {
      var msg = "Typeof binding's identifier must be string";
      console.log(msg);
      isValid = false;
    }

    // Runtime identifier must be unique
    if(this._bindings[typeBinding.runtimeIdentifier] !== null) {
      var msg = "The binding's runtime identifier must be unique";
      console.log(msg);
      isValid = false;
    }

    // Implementation type must be a constructor
    if(typeof typeBinding.implementationType !== "function") {
      var msg = "Typeof binding's implementationType must be a class constructor";
      console.log(msg);
      isValid = false;
    }

    return isValid;
  }

  // The class default constructor
  constructor() {
    this._bindings = new Object();
  }
}

export = Kernel;
