import KernelSettings = require("./kernel_settings");
import Kernel = require("./kernel");
import TypeBinding = require("./type_binding");

var inversify = {
  KernelSettings : KernelSettings,
  Kernel : Kernel,
  TypeBinding : TypeBinding
};

export = inversify;
