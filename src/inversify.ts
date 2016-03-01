///<reference path="./interfaces/interfaces.d.ts" />

// Inversify
// ---------

// The Inversify main file, the library entry point.

import { Kernel } from "./kernel/kernel";
import { Binding } from "./bindings/binding";
import { BindingScope } from "./bindings/binding_scope";
import { Inject } from "./activation/inject";
import { Tagged } from "./activation/tagged";
import { Named } from "./activation/named";
import { ParamNames } from "./activation/paramnames";
import { decorate } from "./activation/decorator_utils";

export { Kernel };
export { Binding };
export { BindingScope };
export { Inject };
export { decorate };
export { Tagged };
export { Named };
export { ParamNames };
