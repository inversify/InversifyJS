///<reference path="./interfaces/interfaces.d.ts" />

// Inversify
// ---------

// The Inversify main file, the library entry point.

import Kernel from "./kernel/kernel";
import injectable from "./annotation/injectable";
import tagged from "./annotation/tagged";
import named from "./annotation/named";
import paramNames from "./annotation/paramnames";
import { decorate } from "./annotation/decorator_utils";

export { Kernel };
export { decorate };
export { injectable };
export { tagged };
export { named };
export { paramNames };
