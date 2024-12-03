import { Newable } from '@inversifyjs/common';

interface Prototype {
  constructor?: Newable;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getBaseType(type: Function): Newable | undefined {
  const prototype: Prototype | null = Object.getPrototypeOf(
    type.prototype,
  ) as Prototype | null;

  const baseType: Newable | undefined = prototype?.constructor;

  return baseType;
}
