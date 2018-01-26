import { UNDEFINED_INJECT_ANNOTATION } from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";
import { tagParameter, tagProperty } from "./decorator_utils";

export type ServiceIdentifierOrFunc = interfaces.ServiceIdentifier<any> | (() => interfaces.ServiceIdentifier<any>);

function isSimpleFunction<T>(value: any): value is () => T {
  return typeof value === "function" && value.length === 0;
}

function inject(serviceIdentifierOrFunc: ServiceIdentifierOrFunc) {
  if (serviceIdentifierOrFunc === undefined) {
    throw new Error(UNDEFINED_INJECT_ANNOTATION);
  }

  return function(target: any, targetKey: string, index?: number): void {
    const serviceIdentifier = isSimpleFunction<interfaces.ServiceIdentifier<any>>(serviceIdentifierOrFunc) ?
      serviceIdentifierOrFunc() : serviceIdentifierOrFunc;
    const metadata = new Metadata(METADATA_KEY.INJECT_TAG, serviceIdentifier);

    if (typeof index === "number") {
      tagParameter(target, targetKey, index, metadata);
    } else {
      tagProperty(target, targetKey, metadata);
    }

  };
}

export { inject };
