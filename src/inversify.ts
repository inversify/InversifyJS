///<reference path="./interfaces/interfaces.d.ts" />

// Inversify
// ---------

// The Inversify main file, the library entry point.

import { Kernel } from "./kernel/kernel";
import { Inject } from "./activation/inject";
import { Tagged } from "./activation/tagged";
import { Named } from "./activation/named";
import { ParamNames } from "./activation/paramnames";
import { decorate } from "./activation/decorator_utils";

export { Kernel };
export { decorate };
export { Inject };
export { Tagged };
export { Named };
export { ParamNames };
