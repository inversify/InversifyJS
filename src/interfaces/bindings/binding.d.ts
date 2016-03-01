interface IBinding<TService> {
  runtimeIdentifier: string;
  implementationType: { new(): TService; };
  cache: TService;
  scope: number;
}
