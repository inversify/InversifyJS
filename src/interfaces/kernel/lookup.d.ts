interface ILookup<T> extends IClonable<ILookup<T>> {
  add(serviceIdentifier: (string|Symbol|any), value: T): void;
  get(serviceIdentifier: (string|Symbol|any)): Array<T>;
  remove(serviceIdentifier: (string|Symbol|any)): void;
  hasKey(serviceIdentifier: (string|Symbol|any)): boolean;
}
