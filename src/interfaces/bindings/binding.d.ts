interface IBinding<T> {
  runtimeIdentifier: string;
  implementationType: { new(): T; };
  factory: (context) => T;
  cache: T;
  scope: number; // BindingScope
  type: number; // BindingType
}
