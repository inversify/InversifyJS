///<reference path="./interfaces/interfaces.d.ts" />

// Inversify
// ---------

// The Inversify main file, the library entry point.

import Kernel from "./kernel/kernel";
import inject from "./activation/inject";
import tagged from "./activation/tagged";
import named from "./activation/named";
import paramNames from "./activation/paramnames";
import { decorate } from "./activation/decorator_utils";

export { Kernel };
export { decorate };
export { inject };
export { tagged };
export { named };
export { paramNames };
