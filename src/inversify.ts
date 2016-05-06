///<reference path="./interfaces/interfaces.d.ts" />

// Inversify
// ---------

// The Inversify main file, the library entry point.

import Kernel from "./kernel/kernel";
import injectable from "./annotation/injectable";
import tagged from "./annotation/tagged";
import named from "./annotation/named";
import inject from "./annotation/inject";
import { makePropertyInjectDecorator, makePropertyMultiInjectDecorator } from "./annotation/property_injectors";
import multiInject from "./annotation/multi_inject";
import targetName from "./annotation/param_name";
import { decorate } from "./annotation/decorator_utils";
import { traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint } from "./syntax/constraint_helpers";

export { Kernel };
export { decorate };
export { injectable };
export { tagged };
export { named };
export { inject };
export { makePropertyInjectDecorator, makePropertyMultiInjectDecorator };
export { multiInject };
export { targetName };
export { traverseAncerstors };
export { taggedConstraint };
export { namedConstraint };
export { typeConstraint };
