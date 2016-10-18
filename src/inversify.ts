// Inversify
// ---------

// The Inversify main file, the library entry point.

export { default as Kernel } from "./kernel/kernel";
export { default as KernelModule } from "./kernel/kernel_module";
export { default as injectable } from "./annotation/injectable";
export { default as tagged } from "./annotation/tagged";
export { default as named } from "./annotation/named";
export { default as inject } from "./annotation/inject";
export { default as unmanaged } from "./annotation/unmanaged";
export { default as multiInject } from "./annotation/multi_inject";
export { default as targetName } from "./annotation/target_name";
export { default as guid } from "./utils/guid";
export { default as interfaces } from "./interfaces/interfaces";
export { decorate } from "./annotation/decorator_utils";
export { traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint } from "./syntax/constraint_helpers";
export { getServiceIdentifierAsString } from "./utils/serialization";
