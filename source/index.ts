///<reference path="./inversify.d.ts" />

// Inversify
// ---------

// The Inversify main file, the librarie entry point.

import KernelSettings = require("./kernel_settings");
import Kernel = require("./kernel");
import TypeBinding = require("./type_binding");

var Inversify = {
  KernelSettings : KernelSettings,
  Kernel : Kernel,
  TypeBinding : TypeBinding
};

export = Inversify;
