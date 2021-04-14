import * as METADATA_KEY from '../constants/metadata_keys';
import * as interfaces from '../interfaces/interfaces';

class Metadata<T = unknown> implements interfaces.Metadata<T> {
  public key: string | number | symbol;
  public value: T;

  public constructor(
    key: string | number | symbol,
    value: T
  ) {
    this.key = key;
    this.value = value;
  }

  public toString(): string {
    if (this.key === METADATA_KEY.NAMED_TAG) {
      return `named: ${this.value ? String(this.value) : ''} `;
    } else {
      return `
        tagged:
          {
            key:${this.key.toString()},
            value: ${String(this.value)}
          }
      `;
    }
  }
}

export { Metadata };
