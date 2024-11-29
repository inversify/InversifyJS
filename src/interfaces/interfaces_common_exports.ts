import { Newable, ServiceIdentifier } from '@inversifyjs/common';

// Unnecesary types to workaround https://github.com/Swatinem/rollup-plugin-dts/issues/325#issuecomment-2507540892

export type CommonNewable<
  TInstance = unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArgs extends unknown[] = any[],
> = Newable<TInstance, TArgs>;

export type CommonServiceIdentifier<TInstance = unknown> =
  ServiceIdentifier<TInstance>;
