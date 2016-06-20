import interfaces from "../interfaces/interfaces";

class KeyValuePair<T> implements interfaces.KeyValuePair<T> {

    public serviceIdentifier: (string|Symbol|any);
    public value: Array<T>;

    public constructor(serviceIdentifier: (string|Symbol|any), value: T) {
        this.serviceIdentifier = serviceIdentifier;
        this.value = new Array<T>();
        this.value.push(value);
    }
}

export default KeyValuePair;
