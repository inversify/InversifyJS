interface IKeyValuePair<T> {
    key: (string|Symbol|any);
    value: Array<T>;
}
