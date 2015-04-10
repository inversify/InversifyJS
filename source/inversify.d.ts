interface TypeBindingInterface<TServiceType> {
  runtimeIdentifier : string;
  implementationType : { new(): TServiceType ;};
  cache : TServiceType;
  scope : string;
}

interface KernelSettingsInterface {
  cache : boolean;
}

interface KernelInterface {
  bind(typeBinding : TypeBindingInterface<any>) : void;
  unbind(runtimeIdentifier : string) : void;
  unbindAll() : void;
  clearCache() : void;
  resolve<TImplementationType>(runtimeIdentifier : string) : TImplementationType;
}
