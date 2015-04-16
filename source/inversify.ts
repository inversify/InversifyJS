///<reference path="./interfaces.d.ts" />

// Inversify
// ---------

// The Inversify main file, the library entry point.

import Kernel = require("./kernel");
import TypeBinding = require("./type_binding");
import TypeBindingScopeEnum = require("./type_binding_scope");

var inversify = {
  Kernel : Kernel,
  TypeBindingScopeEnum : TypeBindingScopeEnum,
  TypeBinding : TypeBinding
};

export = inversify;
