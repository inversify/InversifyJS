///<reference path="./interfaces.d.ts" />

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

// ##### [TypeBindingScopeEnum](http://inversify.io/documentation/type_binding_scope.html)
import TypeBindingScopeEnum = require("./type_binding_scope");

class Kernel implements KernelInterface {

  // The objet properties are used as unique keys type
  // bindings are used as values
  private _bindings : Object;

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

  // Resolves a dependency by its key
  public resolve<TImplementationType>(runtimeIdentifier : string) : TImplementationType {

    var binding : TypeBindingInterface<TImplementationType> = this._bindings[runtimeIdentifier];

    if(typeof binding === "undefined") {
      throw new Error(`Could not resolve service ${runtimeIdentifier}`);
    }

    // The type binding cache is used t store singleton instance
    if((binding.scope === TypeBindingScopeEnum.Singleton) && (binding.cache !== null)) {
      return binding.cache;
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
    if(typeof this._bindings[typeBinding.runtimeIdentifier] !== "undefined") {
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
  private _getConstructorArguments(func : Function) {

    var fnStr, argsInit, argsEnd, result, STRIP_COMMENTS, ARGUMENT_NAMES;

    // Regular expresions used to get a list containing
    // the names of the arguments of a function
    STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    ARGUMENT_NAMES = /([^\s,]+)/g;

    fnStr = func.toString().replace(STRIP_COMMENTS, '');
    argsInit = fnStr.indexOf('(') + 1;
    argsEnd = fnStr.indexOf(')');
    result = fnStr.slice(argsInit, argsEnd).match(ARGUMENT_NAMES);

    if(result === null) {
      result = []
    }

    return result;
  }

  // Examines if a constructor has any dependencies.
  // If so, it will resolve and inject them
  private _injectDependencies<TImplementationType>(
    func : { new(): TImplementationType ;}) : TImplementationType {

      var args = this._getConstructorArguments(func);
      if(args.length === 0) {
        return new func();
      }
      else {
        var injections : Object[] = [], implementation = null;
        for(var i = 0; i < args.length; i++) {
          var service = args[i];
          implementation = this.resolve<any>(service); // TODO: remove any?
          injections.push(implementation);
        }
        return this._construct<TImplementationType>(func, injections);
      }
  }

  // Use of .apply() with 'new' operator. Can call any constructor (except native
  // constructors that behave differently when called  as functions, like String,
  // Number, Date, etc.) with an array of arguments
  private _construct<TImplementationType>(
    constr : { new(): TImplementationType ;}, args : Object[]) : TImplementationType {

    function F() : void {
      constr.apply(this, args);
    }

    F.prototype = constr.prototype;
    return new F();
  }

  // The class default constructor
  constructor() {
    this._bindings = new Object();
  }
}

export = Kernel;
