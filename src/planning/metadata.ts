import { interfaces } from "../interfaces/interfaces";
import * as METADATA_KEY from "../constants/metadata_keys";

class Metadata implements interfaces.Metadata {

  public key: string;
  public value: any;

  constructor(key: string, value: any) {
    this.key = key;
    this.value = value;
  }

  public toString() {
    if (this.key === METADATA_KEY.NAMED_TAG) {
      return `named: ${this.value} `;
    } else {
      return `tagged: { key:${this.key}, value: ${this.value} }`;
    }
  }
}

export { Metadata };
