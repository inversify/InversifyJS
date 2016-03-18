///<reference path="./interfaces/interfaces.d.ts" />

// Inversify
// ---------

// The Inversify main file, the library entry point.

import Kernel from "./kernel/kernel";
import inject from "./annotation/inject";
import tagged from "./annotation/tagged";
import named from "./annotation/named";
import paramNames from "./annotation/paramnames";
import { decorate } from "./annotation/decorator_utils";

export { Kernel };
export { decorate };
export { inject };
export { tagged };
export { named };
export { paramNames };
