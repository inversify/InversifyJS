import * as METADATA_KEY from '../constants/metadata_keys';
import { interfaces } from '../interfaces/interfaces';


class Metadata implements interfaces.Metadata {

  public key: string | number | symbol;
  public value: unknown;

  public constructor(
    key: string | number | symbol,
    value: unknown
  ) {
    this.key = key;
    this.value = value;
  }

  public toString() {
    if (this.key === METADATA_KEY.NAMED_TAG) {
      return `named: ${String(this.value).toString()} `;
    } else {
      return `tagged: { key:${this.key.toString()}, value: ${String(this.value)} }`;
    }
  }
}

export { Metadata };
