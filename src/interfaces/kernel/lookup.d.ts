interface ILookup<T> {
  add(key: (string|Symbol|any), value: T): void;
  get(key: (string|Symbol|any)): Array<T>;
  remove(key: (string|Symbol|any)): void;
  hasKey(key: (string|Symbol|any)): boolean;
}
