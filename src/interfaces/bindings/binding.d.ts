/// <reference path="../interfaces.d.ts" />

interface IBinding<T> {
  runtimeIdentifier: string;
  implementationType: INewable<T>;
  factory: IFactoryCreator<any>;
  provider: IProviderCreator<any>;
  constraint: (request: IRequest) => boolean;
  proxyMaker: (injectable: T) => T;
  cache: T;
  scope: number; // BindingScope
  type: number; // BindingType
}
