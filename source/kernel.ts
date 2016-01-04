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

import { TypeBindingScopeEnum } from "./type_binding_scope";
import { Lookup } from "./lookup";

declare var Map;

class Kernel implements IKernel {

  // The objet properties are used as unique keys type
  // bindings are used as values
  private _bindingDictionary : ILookup<ITypeBinding<any>>;

  // The class default constructor
  constructor() {
    this._bindingDictionary = new Lookup<ITypeBinding<any>>();
  }

  // Regiters a type binding
  public bind(typeBinding : ITypeBinding<any>) : void {
    this._bindingDictionary.add(typeBinding.runtimeIdentifier, typeBinding);
  }

  // Removes a type binding from the registry by its key
  public unbind(runtimeIdentifier : string) : void {
    try {
      this._bindingDictionary.remove(runtimeIdentifier);
    }
    catch(e) {
      throw new Error(`Could not resolve service ${runtimeIdentifier}`);
    }
  }

  // Removes all the type bindings from the registry
  public unbindAll() : void {
    this._bindingDictionary = new Lookup<ITypeBinding<any>>();
  }

  // Resolves a dependency by its key
  public resolve<TImplementationType>(runtimeIdentifier : string) : TImplementationType {

    var bindings : ITypeBinding<TImplementationType>[]
    if(this._bindingDictionary.hasKey(runtimeIdentifier)) {
      bindings = this._bindingDictionary.get(runtimeIdentifier);
    }
    else {
      return null;
    }

    // NOTE: this will be remove when contextual binding support is added
    var binding = bindings[0];

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

  // Take a function as argument and discovers
  // the names of its arguments at run-time
  private _getConstructorArguments(func : Function) {

    var fnStr, argsInit, argsEnd, result, STRIP_COMMENTS, ARGUMENT_NAMES;

    // Regular expressions used to get a list containing
    // the names of the arguments of a function
    STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    ARGUMENT_NAMES = /([^\s,]+)/g;

    fnStr = func.toString().replace(STRIP_COMMENTS, '');
    argsInit = fnStr.indexOf('(') + 1;
    argsEnd = fnStr.indexOf(')');

    // If using ES6 classes and there is no constructor
    // there is no need to parser constructor args
    if('function' === typeof Map &&
       /\b(class)\b/.test(fnStr) &&
       /\b(constructor)\b/.test(fnStr) === false) {

      result = null;
    }
    else {
      result = fnStr.slice(argsInit, argsEnd).match(ARGUMENT_NAMES);
    }

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
      return new (Function.prototype.bind.apply(constr, [null].concat(args)));
  }

}

export { Kernel };
