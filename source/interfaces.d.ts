interface ITypeBinding<TServiceType> {
  runtimeIdentifier : string;
  implementationType : { new(): TServiceType ;};
  cache : TServiceType;
  scope : number; // TypeBindingScopeEnum
}

interface IKernel {
  bind(typeBinding : ITypeBinding<any>) : void;
  unbind(runtimeIdentifier : string) : void;
  unbindAll() : void;
  resolve<TImplementationType>(runtimeIdentifier : string) : TImplementationType;
}

interface IKeyValuePair<T> {
	key : string;
	value : Array<T>;
}

interface ILookup<T> {
  add(key : string, value : T) : void;
  get(key : string) : Array<T>;
  remove(key : string) : void;
  hasKey(key : string) : boolean;
}
