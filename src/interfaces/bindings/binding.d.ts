/// <reference path="../interfaces.d.ts" />

interface IBinding<T> {
  runtimeIdentifier: string;
  implementationType: { new(): T; };
  factory: IFactory<T>;
  provider: IProvider<T>;
  cache: T;
  scope: number; // BindingScope
  type: number; // BindingType
}
