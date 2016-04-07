interface IKeyValuePair<T> {
    serviceIdentifier: (string|Symbol|any);
    value: Array<T>;
}
