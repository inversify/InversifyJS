///<reference path="./interfaces.d.ts" />

// Inversify
// ---------

// The Inversify main file, the library entry point.

// ##### [Kernel](http://inversify.io/documentation/kernel.html)
import Kernel = require("./kernel");

// ##### [TypeBinding ](http://inversify.io/documentation/type_binding.html)
import TypeBinding = require("./type_binding");

// ##### [TypeBindingScopeEnum](http://inversify.io/documentation/type_binding_scope.html)
import TypeBindingScopeEnum = require("./type_binding_scope");

var inversify = {
  Kernel : Kernel,
  TypeBindingScopeEnum : TypeBindingScopeEnum,
  TypeBinding : TypeBinding
};

export = inversify;
