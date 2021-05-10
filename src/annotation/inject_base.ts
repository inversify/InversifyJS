import { UNDEFINED_INJECT_ANNOTATION } from "../constants/error_msgs";
import { Metadata } from "../planning/metadata";
import { createTaggedDecorator } from "./decorator_utils";
import { ServiceIdentifierOrFunc } from "./lazy_service_identifier";

export function injectBase(metadataKey:string){
  return (serviceIdentifier: ServiceIdentifierOrFunc) => {
    return (target:any, targetKey:string | symbol, indexOrPropertyDescriptor?:number | TypedPropertyDescriptor<unknown>) => {
      if (serviceIdentifier === undefined) {
        throw new Error(UNDEFINED_INJECT_ANNOTATION(target.name));
      }
      return createTaggedDecorator(
        new Metadata(metadataKey, serviceIdentifier)
      )(target, targetKey,indexOrPropertyDescriptor);
    };
  }
}