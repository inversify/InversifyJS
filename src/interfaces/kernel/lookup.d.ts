interface ILookup<T> {
  add(key: string, value: T): void;
  get(key: string): Array<T>;
  remove(key: string): void;
  hasKey(key: string): boolean;
}
