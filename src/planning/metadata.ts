import { ServiceIdentifierOrFunc } from '../annotation/inject';
import * as METADATA_KEY from '../constants/metadata_keys';
import * as interfaces from '../interfaces/interfaces';

export type AnyMetadataValue = interfaces.IndexObject | ServiceIdentifierOrFunc | string | number | symbol | undefined;

class Metadata implements interfaces.Metadata {
  public key: string | number | symbol;
  public value: AnyMetadataValue;

  public constructor(key: string | number | symbol, value: AnyMetadataValue) {
    this.key = key;
    this.value = value;
  }

  public toString(): string {
    if (this.key === METADATA_KEY.NAMED_TAG) {
      return `named: ${this.value ? this.value.toString() : ''} `;
    } else {
      return `tagged: { key:${this.key.toString()}, value: ${String(this.value)} }`;
    }
  }
}

export { Metadata };
