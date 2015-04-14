///<reference path="./inversify.d.ts" />

// Kernel
// ------

// Inversify is a lightweight pico container for TypeScript
// and JavaScript apps.

// A pico container uses a class constructor to identify and
// inject its dependencies. For this to work, the class needs
// to declare a constructor that includes everything it
// needs injected.

// In order to resolve a depencency, the pico container needs
// to be told which implementation type (classes) to associate
// with each service type (interfaces).

import KernelSettings = require("./kernel_settings");

class Kernel implements KernelInterface {

  // The internal kernel configuration
  private _settings : KernelSettings;

  // The objet properties are used as unique keys type
  // bindings are used as values
  private _bindings : Object;

  // Regular expresions used to get a list containing
  // the names of the arguments of a function
  private STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  private ARGUMENT_NAMES = /([^\s,]+)/g;

  // Regiters a type binding
  public bind(typeBinding : TypeBindingInterface<any>) : void {
    if(this._validateBinding(typeBinding) === true){
      this._bindings[typeBinding.runtimeIdentifier] = typeBinding;
    }
  }

  // Removes a type binding from the registry by its key
  public unbind(runtimeIdentifier : string) : void {
    var binding = this._bindings[runtimeIdentifier];

    if(typeof binding === "undefined") {
      throw new Error(`Could not resolve service ${runtimeIdentifier}`);
    }
    delete this._bindings[runtimeIdentifier];
  }

  // Removes all the type bindings from the registry
  public unbindAll() : void {
    this._bindings = new Object();
  }

  // Clears the cache, this can be useful in very large apps
  public clearCache() : void {
    for (var property in this._bindings) {
      if (this._bindings.hasOwnProperty(property)) {
        this._bindings[property].cache = null;
      }
    }
  }

  // Resolves a dependency by its key
  public resolve<TImplementationType>(runtimeIdentifier : string) : TImplementationType {

    var binding = this._bindings[runtimeIdentifier];

    if(typeof binding === "undefined") {
      throw new Error(`Could not resolve service ${runtimeIdentifier}`);
    }

    // Use cache only if enabled by settings
    if(this._settings.cache === true && binding.cache !== null) {
      // return clone of cached instance
      var json = JSON.stringify(binding.cache);
      var clone = JSON.parse(json);
      return clone;
    }
    else {
      var result = this._injectDependencies<TImplementationType>(binding.implementationType);
      binding.cache = result;
      return result;
    }
  }

  // Validates a type binding
  private _validateBinding(typeBinding : TypeBindingInterface<any>) : boolean {

    var isValid = true;

    // Runtime identifier is a string
    if(typeof typeBinding.runtimeIdentifier !== "string") {
      var msg = `Expected type of ${typeBinding.runtimeIdentifier} to be string`;
      console.log(msg);
      isValid = false;
    }

    // Runtime identifier must be unique
    if(this._bindings[typeBinding.runtimeIdentifier] !== null) {
      var msg = `Dublicated binding runtime identifier ${typeBinding.runtimeIdentifier}`;
      console.log(msg);
      isValid = false;
    }

    // Implementation type must be a constructor
    if(typeof typeBinding.implementationType !== "function") {
      var msg = `Expected ${typeBinding.implementationType} to be a constructor`;
      console.log(msg);
      isValid = false;
    }

    return isValid;
  }

  // Take a function as argument and discovers
  // the names of its arguments at run-time
  private _getFunctionArgumentsmNames(func : Function) {

    var fnStr, argsInit, argsEnd, result;

    fnStr = func.toString().replace(this.STRIP_COMMENTS, '');
    argsInit = fnStr.indexOf('(') + 1;
    argsEnd = fnStr.indexOf(')');
    result = fnStr.slice(argsInit, argsEnd).match(this.ARGUMENT_NAMES);

    if(result === null) {
      result = []
    }

    return result;
  }

  // Examines if a constructor has any dependencies.
  // If so, it will resolve and inject them
  private _injectDependencies<TImplementationType>(
    func : { new(): TImplementationType ;}) : TImplementationType {

      var args = this._getFunctionArgumentsmNames(func);
      if(args.length === 0) {
        return new func();
      }
      else {
        var injections = [], implementation = null;
        for(var i = 0; i < args.length; i++) {
          var service = args[i];
          implementation = this.resolve<any>(service); // TODO: remove any?
          injections.push(implementation);
        }
        implementation = func.apply(func.prototype, injections);
        implementation.prototype = func.prototype;
        return implementation;
      }
  }

  // The class default constructor
  constructor(settings? : KernelSettings) {
    if(typeof settings === "undefined") {

      // use default settings
      this._settings = new KernelSettings();
    }
    else {
      this._settings = settings;
    }
    this._bindings = new Object();
  }
}

export = Kernel;
