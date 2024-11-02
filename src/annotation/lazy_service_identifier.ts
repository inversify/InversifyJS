import { LazyServiceIdentifier } from '@inversifyjs/common';

import { interfaces } from '../interfaces/interfaces';

export type ServiceIdentifierOrFunc<T> =
  | interfaces.ServiceIdentifier<T>
  | LazyServiceIdentifier<T>;
