/// <reference path="../interfaces.d.ts" />

interface IBinding<T> {
  activated: boolean;
  runtimeIdentifier: string;
  implementationType: INewable<T>;
  factory: IFactoryCreator<any>;
  provider: IProviderCreator<any>;
  constraint: (request: IRequest) => boolean;
  onActivation: (context: IContext, injectable: T) => T;
  cache: T;
  scope: number; // BindingScope
  type: number; // BindingType
}
