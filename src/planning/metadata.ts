///<reference path="../interfaces/interfaces.d.ts" />

class Metadata implements IMetadata {

  public key: string;
  public value: any;

  constructor(key: string, value: any) {
      this.key = key;
      this.value = value;
  }
}

export default Metadata;
