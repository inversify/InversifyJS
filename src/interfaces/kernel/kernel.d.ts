///<reference path="../interfaces.d.ts" />

interface IKernel {
  bind<T>(runtimeIdentifier: (string|Symbol|T)): IBindingToSyntax<T>;
  unbind(runtimeIdentifier: (string|Symbol|any)): void;
  unbindAll(): void;
  get<T>(runtimeIdentifier: (string|Symbol|T)): T;
  getAll<T>(runtimeIdentifier: (string|Symbol|T)): T[];
  load(...modules: IKernelModule[]): void;
  applyMiddleware(...middleware: IMiddleware[]): void;
}
