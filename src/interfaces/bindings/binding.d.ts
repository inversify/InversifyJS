/// <reference path="../interfaces.d.ts" />

interface IBinding<T> {
  runtimeIdentifier: string;
  implementationType: INewable<T>;
  factory: IFactoryCreator<any>;
  provider: IProviderCreator<any>;
  cache: T;
  scope: number; // BindingScope
  type: number; // BindingType
}
