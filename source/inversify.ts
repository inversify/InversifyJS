///<reference path="./interfaces.d.ts" />

// Inversify
// ---------

// The Inversify main file, the library entry point.

import { Kernel } from "./kernel";
import { TypeBinding } from "./type_binding";
import { TypeBindingScopeEnum } from "./type_binding_scope";

var inversify = {
  Kernel : Kernel,
  TypeBinding : TypeBinding,
  TypeBindingScopeEnum : TypeBindingScopeEnum
};

export { inversify };
