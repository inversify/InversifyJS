///<reference path="../interfaces/interfaces.d.ts" />

class KeyValuePair<T> implements IKeyValuePair<T> {

    public key: string;
    public value: Array<T>;

    public constructor(key: string, value: T) {
        this.key = key;
        this.value = new Array<T>();
        this.value.push(value);
    }
}

export default KeyValuePair;
