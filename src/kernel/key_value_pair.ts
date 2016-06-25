import interfaces from "../interfaces/interfaces";
import guid from "../utils/guid";

class KeyValuePair<T> implements interfaces.KeyValuePair<T> {

    public serviceIdentifier: (string|Symbol|any);
    public value: Array<T>;
    public guid: string;

    public constructor(serviceIdentifier: (string|Symbol|any), value: T) {
        this.serviceIdentifier = serviceIdentifier;
        this.value = new Array<T>();
        this.value.push(value);
        this.guid = guid();
    }
}

export default KeyValuePair;
