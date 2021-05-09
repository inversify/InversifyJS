import { UNDEFINED_INJECT_ANNOTATION } from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";
import { createTaggedDecoratorInternal } from "./decorator_utils";

export type ServiceIdentifierOrFunc = interfaces.ServiceIdentifier<any> | LazyServiceIdentifer;

export class LazyServiceIdentifer<T = any> {
  private _cb: () => interfaces.ServiceIdentifier<T>;
  public constructor(cb: () => interfaces.ServiceIdentifier<T>) {
      this._cb = cb;
  }

  public unwrap() {
    return this._cb();
  }
}

function inject(serviceIdentifier: ServiceIdentifierOrFunc) {
  return createTaggedDecoratorInternal(new Metadata(METADATA_KEY.INJECT_TAG, serviceIdentifier),target => {
    if (serviceIdentifier === undefined) {
      throw new Error(UNDEFINED_INJECT_ANNOTATION(target.name));
    }
  })
}

export { inject };
