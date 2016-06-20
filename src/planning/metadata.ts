import interfaces from "../interfaces/interfaces";

class Metadata implements interfaces.Metadata {

  public key: string;
  public value: any;

  constructor(key: string, value: any) {
      this.key = key;
      this.value = value;
  }
}

export default Metadata;
