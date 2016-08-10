// Inversify
// ---------

// The Inversify main file, the library entry point.

import Kernel from "./kernel/kernel";
import KernelModule from "./kernel/kernel_module";
import injectable from "./annotation/injectable";
import tagged from "./annotation/tagged";
import named from "./annotation/named";
import inject from "./annotation/inject";
import unmanaged from "./annotation/unmanaged";
import multiInject from "./annotation/multi_inject";
import targetName from "./annotation/target_name";
import { decorate } from "./annotation/decorator_utils";
import { traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint } from "./syntax/constraint_helpers";
import guid from "./utils/guid";

export { Kernel };
export { KernelModule };
export { decorate };
export { injectable };
export { tagged };
export { named };
export { inject };
export { unmanaged };
export { multiInject };
export { targetName };
export { traverseAncerstors };
export { taggedConstraint };
export { namedConstraint };
export { typeConstraint };
export { guid };
