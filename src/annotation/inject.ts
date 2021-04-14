import { UNDEFINED_INJECT_ANNOTATION } from '../constants/error_msgs';
import * as METADATA_KEY from '../constants/metadata_keys';
import * as interfaces from '../interfaces/interfaces';
import { Metadata } from '../planning/metadata';
import { tagParameter, tagProperty } from './decorator_utils';

export type ServiceIdentifierOrFunc = interfaces.ServiceIdentifier<unknown> | LazyServiceIdentifer;

export class LazyServiceIdentifer<T = unknown> {
  private _cb: () => interfaces.ServiceIdentifier<T>;
  public constructor(cb: () => interfaces.ServiceIdentifier<T>) {
    this._cb = cb;
  }

  public unwrap(): interfaces.ServiceIdentifier<T> {
    return this._cb();
  }
}

function inject(serviceIdentifier: ServiceIdentifierOrFunc) {
  return function (target: NewableFunction, targetKey: string, index?: number): void {
    if (serviceIdentifier === undefined) {
      throw new Error(UNDEFINED_INJECT_ANNOTATION(target.name));
    }

    const metadata = new Metadata(METADATA_KEY.INJECT_TAG, serviceIdentifier);

    if (typeof index === 'number') {
      tagParameter(target, targetKey, index, metadata);
    } else {
      tagProperty(target, targetKey, metadata);
    }
  };
}

export { inject };
