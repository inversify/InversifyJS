import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { ServiceIdentifierOrFunc } from "../annotation/lazy_service_identifier";

export type MetadataValue<T> = string | number | symbol | boolean | ServiceIdentifierOrFunc<T>;

class Metadata<T = MetadataValue<unknown>> implements interfaces.Metadata {

  public key: string | number | symbol;
  public value: MetadataValue<T>;

  public constructor(
    key: string | number | symbol,
    value: MetadataValue<T>
  ) {
    this.key = key;
    this.value = value;
  }

  public toString() {
    if (this.key === METADATA_KEY.NAMED_TAG) {
      return `named: ${this.value.toString()} `;
    } else {
      return `tagged: { key:${this.key.toString()}, value: ${String(this.value)} }`;
    }
  }
}

export { Metadata };
