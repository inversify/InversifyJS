///<reference path="../interfaces/interfaces.d.ts" />

class KeyValuePair<T> implements IKeyValuePair<T> {

    public serviceIdentifier: (string|Symbol|any);
    public value: Array<T>;

    public constructor(serviceIdentifier: (string|Symbol|any), value: T) {
        this.serviceIdentifier = serviceIdentifier;
        this.value = new Array<T>();
        this.value.push(value);
    }
}

export default KeyValuePair;
