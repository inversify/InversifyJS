///<reference path="../interfaces.d.ts" />

interface IKernel {
  bind<T>(runtimeIdentifier: string): IBindingToSyntax<T>;
  unbind(runtimeIdentifier: string): void;
  unbindAll(): void;
  get<T>(runtimeIdentifier: string): T;
  getAll<T>(runtimeIdentifier: string): T[];
  load(...modules: IKernelModule[]): void;
  applyMiddleware(...middleware: IMiddleware[]): void;
}
